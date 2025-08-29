import React, { useEffect } from "react";
import { FaGithub } from "react-icons/fa";
import Cookies from "js-cookie";
import { useLog } from "@/context/LogContext";

const clientId = "Ov23liCEOp38jpHimMdz"; 
const redirectUri = "http://localhost:5173/home/dashboard";

const GithubLogin = () => {
  const { addLog } = useLog();

  const handleLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user user:email`;
    window.location.href = githubAuthUrl;
    addLog("User initiated GitHub login");
  };

  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      
      const user = {
        username: "GitHubUser",
        email: "user@example.com",
      };
      const logInTime = new Date().toISOString();

      Cookies.set("user", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user));

      addLog(`${user.username} logged in via GitHub at ${logInTime}`);

     
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.href = "/home/dashboard"; 
    }
  }, [addLog]);

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-300 bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
    >
      <FaGithub size={20} />
      Login with GitHub
    </button>
  );
};

export default GithubLogin;
