import { spotify, lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { scopes } from "@/lib/spotify";
import { getUserByUsername, createUser } from "@/lib/user";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("spotify_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await spotify.validateAuthorizationCode(code);
    const spotifyUserResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const spotifyUser: SpotifyUser = await spotifyUserResponse.json();
    const existingUser = await getUserByUsername(spotifyUser.id);

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    const avatar = spotifyUser.images[0]?.url ?? ""; // Avatar is optional, so we default to an empty string
    const user = await createUser({
      username: spotifyUser.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.accessTokenExpiresAt,
      scopes: scopes,
      avatar,
    });

    // If the user could not be created, return a 500 error
    if (!user) {
      return new Response(null, {
        status: 500,
      });
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
}

interface SpotifyUser {
  id: string; // This is the spotify username
  display_name: string;
  email: string;
  images: { url: string; height: number; width: number }[];
}
