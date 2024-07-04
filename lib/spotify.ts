import { Buffer } from "buffer";
import { updateAccessTokens } from "./user";

export const scopes = [
  "user-read-email",
  "user-library-read",
  "user-top-read",
  "user-read-recently-played",
];

type UpdatedTokens = {
  accessToken: string;
  refreshToken: string;
  expires: string;
};

// A function for refreshing the access token for a user
export const refreshAccessTokens = async (
  refreshToken: string
): Promise<UpdatedTokens | null> => {
  try {
    const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!spotifyClientId || !spotifyClientSecret) {
      throw new Error("Missing Spotify client ID");
    }
    const basicCreds = Buffer.from(
      spotifyClientId + ":" + spotifyClientSecret
    ).toString("base64");
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicCreds}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      const { status, message } = json.error;
      throw new Error(`Failed to refresh token, ${status}, ${message}`);
    }

    const accessToken = json.access_token;
    if (!accessToken) {
      // We _need_ an access token or we can't do anything
      throw new Error(
        `Failed to refresh token, no access token found in response`
      );
    }

    let newRefreshToken = json.refresh_token; // Change this to the one given if there's not a new one
    if (!newRefreshToken) {
      // As long as we have an access token, we can continue for now, but we should log this
      console.warn(
        `No refresh token found in response, user will need to re-authenticate soon`
      );
      newRefreshToken = refreshToken;
    }

    return {
      accessToken: accessToken,
      refreshToken: newRefreshToken,
      expires: json.expires_in,
    };
  } catch (e) {
    console.error(`Error refreshing access token: ${e}`);
    return null;
  }
};

type TrackData = {
  track: {
    name: string;
    external_urls: {
      spotify: string;
    };
    album: {
      images: [
        {
          url: string;
          width: number;
          height: number;
        }
      ];
      name: string;
      release_date: string;
      external_urls: {
        spotify: string;
      };
      artists: [
        {
          name: string;
          external_urls: {
            spotify: string;
          };
        }
      ];
    };
  };
  played_at: string;
};

// Using the Get Recently Played Tracks API https://developer.spotify.com/documentation/web-api/reference/get-recently-played
export const getRecentTracks = async (
  userId: string,
  tokens: {
    accessToken: string;
    refreshToken: string;
  },
  isRetry?: boolean
): Promise<TrackData[]> => {
  const ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played";
  const limit = 24; // Used in a grid of 3 columns, so best to keep it a multiple of 3
  // Get todays date and subtract 1 day, then convert to an Unix timestamp
  const url = new URL(ENDPOINT);
  url.searchParams.append("limit", limit.toString());

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  const json = await res.json();

  const items = json.items as TrackData[];
  if (!items) {
    // Check if its an access token error, and attempt to refresh the token
    if (json.error?.status === 401) {
      const newTokens = await refreshAccessTokens(tokens.refreshToken);
      // Successfully got new tokens, update account in database
      if (newTokens) {
        updateAccessTokens(
          userId,
          newTokens.accessToken,
          newTokens.refreshToken,
          new Date(newTokens.expires)
        );
        // If we're not already in a retry, try again
        if (!isRetry) {
          return getRecentTracks(userId, newTokens, true);
        }
      }
      console.warn("Failed to get recent tracks, failed to refresh token");
      return [];
    }
    throw new Error("Failed to get recent tracks, no items found in response");
  }
  // Organize the tracks by date listened
  items.sort((a, b) => (a.played_at > b.played_at ? -1 : 1));
  return items;
};
