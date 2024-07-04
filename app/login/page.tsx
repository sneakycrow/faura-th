import SpotifyLoginButton from "../components/spotifyLoginButton";

const LoginPage = async () => {
  return (
    <main className="flex flex-col items-center justify-center min-w-screen min-h-screen dark:text-cherry">
      <SpotifyLoginButton />
    </main>
  );
};

export default LoginPage;
