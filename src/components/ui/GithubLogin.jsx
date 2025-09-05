
import { Github } from 'lucide-react';

const GithubLogin = () => {
  const clientId = "Ov23li9lKvGYTZwkMWgL";
  const redirectUri = "http://localhost:5173/home/dashboard"; 
  const handleLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user`;
    window.location.href = githubAuthUrl;
    localStorage.setItem("user", JSON.stringify({ username: "Vishnuprasad" }));
    // navigate("/home/dashboard");
  };

  return (
     <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-300 bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
    >
      <Github/>
      Login with GitHub
    </button>
  );
};

export default GithubLogin;
