import { client } from "./db";
import { Prisma, type User } from "@prisma/client";
import { nanoid } from "nanoid";

const userWithTokens = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    Token: true,
  },
});

type UserWithTokens = Prisma.UserGetPayload<typeof userWithTokens>;

// A function for getting a user by their username
// Returns null if the user was not found or if an error occurred
export const getUserByUsername = async (
  username: string
): Promise<UserWithTokens | null> => {
  try {
    return await client.user.findUnique({
      where: {
        spotify_username: username,
      },
      include: {
        Token: true,
      },
    });
  } catch (e) {
    console.error(`Error getting user by username: ${e}`);
    return null;
  }
};

// All required data to generate a new user
type RequiredUserProperties = {
  username: string; // Spotify username
  accessToken: string; // Spotify access token
  refreshToken: string; // Spotify refresh token
  expiresAt: Date; // Token expiration time
  scopes: string[]; // Spotify scopes
  avatar: string; // Spotify avatar URL
};

// A function for creating a new user
// Returns the created user or null if an error occurred
export const createUser = async (
  data: RequiredUserProperties
): Promise<User | null> => {
  try {
    // Generate a readable user ID using nanoid
    // This allows is to have nice urls in the future while still benefitting for avoiding collision
    const id = nanoid(10);
    const tokenId = nanoid(); // This one doesn't need to be readable, so we can use a longer ID
    return await client.user.create({
      data: {
        id,
        spotify_username: data.username,
        avatar: data.avatar,
        Token: {
          create: [
            {
              id: tokenId,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expiresAt: data.expiresAt,
            },
          ],
        },
      },
    });
  } catch (e) {
    console.error(`Error creating user: ${e}`);
    return null;
  }
};

// A function that saves new tokens for a user
export const updateAccessTokens = async (
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date
): Promise<void> => {
  try {
    // Successfully got new tokens, update account in database
    await client.token.update({
      where: {
        id: userId,
      },
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: expiresAt,
      },
    });
  } catch (e) {
    console.error(`Error updating tokens: ${e}`);
  }
};
