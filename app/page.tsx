import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ProfileMini from "./components/profileMini";
import SpotifyLoginButton from "./components/spotifyLoginButton";
import { Button } from "./components/button";
import { getUserByUsername } from "@/lib/user";
import { getRecentTracks } from "@/lib/spotify";
import Record from "./components/Record";

export const Home = async () => {
  const { user } = await validateRequest();
  // If the user is logged in, get their recent tracks, otherwise get the feature user's recent tracks
  const targetUserName = user
    ? user.username
    : process.env.SPOTIFY_FEATURED_USER;
  // If there's no user (like if feature user isn't set), we can't get their recent tracks
  if (!targetUserName) {
    console.log(`farting`);
    return <div>Feature user not set</div>;
  }
  const dbUser = await getUserByUsername(targetUserName);
  // If we have a db user, get their Spotify tokens
  // It should be the first token, if they don't have any tokens, it will be null
  const spotifyTokens = dbUser ? dbUser.Token[0] ?? null : null;
  const recentTracks = user
    ? await getRecentTracks(user.id, {
        accessToken: spotifyTokens?.accessToken ?? "", // can be null if there's no user, but we check upstream
        refreshToken: spotifyTokens?.refreshToken ?? "",
      })
    : null;

  // A simple logout form, this mostly exists just for readability
  const Logout = () => {
    return (
      <form action={logout}>
        <button className="hover:text-red-500">Logout</button>
      </form>
    );
  };
  return (
    <main className="p-20 flex flex-col items-center justify-center min-w-screen min-h-screen dark:text-cherry">
      <div className="font-bold text-center my-10">
        <h1 className="text-5xl text-cherry">Recent Record Shelf</h1>
        <p className="text-3xl text-coral">
          A digital record shelf showing your recent spotify records
        </p>
      </div>
      {user ? (
        <section className="flex flex-col items-center mx-auto">
          {/* Record Shelf */}
          <aside className="grid lg:grid-cols-3 gap-10">
            {recentTracks &&
              recentTracks
                .slice(0, 9)
                .map((record, index) => (
                  <Record
                    key={index}
                    artist={record.track.album.artists[0].name}
                    album={record.track.album.name}
                    title={record.track.name}
                    releaseDate={record.track.album.release_date}
                    cover={record.track.album.images[0].url}
                  />
                ))}
          </aside>
          <div className="mt-20">
            <ProfileMini
              avatar={user.avatar}
              username={user.username}
              logout={<Logout />}
            />
          </div>
        </section>
      ) : (
        <SpotifyLoginButton />
      )}
    </main>
  );
};

async function logout(): Promise<ActionResult> {
  "use server";
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect("/login");
}

interface ActionResult {
  error: string | null;
}

export default Home;
