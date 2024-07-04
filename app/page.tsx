import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ProfileMini from "./components/profileMini";
import SpotifyLoginButton from "./components/spotifyLoginButton";
import { getUserByUsername } from "@/lib/user";
import { getRecentTracks } from "@/lib/spotify";
import Record from "./components/record";

const Home = async () => {
  const { user } = await validateRequest();
  // If the user is logged in, get their recent tracks, otherwise get the feature user's recent tracks
  const targetUserName = user
    ? user.username
    : process.env.SPOTIFY_FEATURED_USER;
  const dbUser = targetUserName
    ? await getUserByUsername(targetUserName)
    : null;
  // If we have a db user, get their Spotify tokens
  // It should be the first token, if they don't have any tokens, it will be null
  const spotifyTokens = dbUser ? dbUser.Token[0] ?? null : null;
  const recentTracks =
    spotifyTokens && dbUser
      ? await getRecentTracks(dbUser.id, {
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
      <div className="flex flex-col justify-center items-center font-bold text-center my-10">
        <h1 className="text-5xl text-cherry">Recent Record Shelf</h1>
        <p className="text-3xl text-coral">
          A digital record shelf showing your recent spotify records
        </p>
        {!user && (
          <div className="flex flex-col space-y-4 mt-10">
            <p className="text-sm">Sign in to customize your shelf</p>
            <SpotifyLoginButton />
          </div>
        )}
      </div>
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
        {user && (
          <div className="mt-20">
            <ProfileMini
              avatar={user.avatar}
              username={user.username}
              logout={<Logout />}
            />
          </div>
        )}
      </section>
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
  return redirect("/");
}

interface ActionResult {
  error: string | null;
}

export default Home;
