import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useLog } from "@/context/LogContext";
import GithubLogin from "./GithubLogin";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { decryptData, encryptData } from "../Store/authUtils";

// Normal login function (with decrypted password check)
function loginUser({ username, password }) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(
    (u) => u.username === username && decryptData(u.password) === password
  );

  if (user) {
    return { success: true, user };
  } else {
    return { success: false, message: "Invalid username or password" };
  }
}

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const { addLog } = useLog();



  // Load remembered credentials
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");
    if (savedUsername && savedPassword) {
      setRememberMe(true);
      setValue("username", savedUsername);
      setValue("password", savedPassword);
    }
  }, [setValue]);

  // Handle GitHub OAuth simulation
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get("code");

    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);

      const user = {
        username: "github_demo",
        email: "demo@github.com",
        provider: "github",
      };
      const logInTime = new Date().toISOString();

      Cookies.set("currentUser", encryptData(user), {
        expires: rememberMe ? 7 : undefined,
      });
      localStorage.setItem("user", JSON.stringify(user));

      // fetch("http://localhost:5000/session", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ ...user, logInTime }),
      // });

      addLog(` logged in with GitHub`);
      window.location.href = "/home/dashboard";
    }
  }, [ rememberMe, addLog]);

  // Handle normal login
  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    const response =  loginUser(data);

    if (rememberMe) {
      localStorage.setItem("username", data.username);
      localStorage.setItem("password", data.password);
    } else {
      localStorage.removeItem("username");
      localStorage.removeItem("password");
    }

    if (response.success) {
      const user = response.user;

      Cookies.set("currentUser", encryptData(user), {
        expires: rememberMe ? 7 : undefined,
      });

      
      window.location.href = "/home/dashboard";

    } else {
      setError(response.message);
    }
    setLoading(false);
  };

  // Handle Google login
const handleGoogleLogin = (credentialResponse) => {
  setError("");

  try {
    const token = credentialResponse?.credential;
    if (!token) throw new Error("No credentials found");

    const decoded = jwtDecode(token);
    if (!decoded?.name || !decoded?.email) throw new Error("Invalid token data");

    const user = {
      username: decoded.name,
      email: decoded.email,
      provider: "google",
    };

    const logInTime = new Date().toISOString();

    Cookies.set("currentUser", encryptData(user), {
      expires: rememberMe ? 7 : undefined,
    });
    localStorage.setItem("user", JSON.stringify(user));

    addLog(`${user.username} logged in via Google`);

    // 🔑 This replaces navigate("/home/dashboard")
    window.location.href = "/home/dashboard"; 
    // or use window.location.replace("/home/dashboard"); if you don't want back button
  } catch (err) {
    console.error("Google login error:", err);
    setError("Google login failed. Please try again.");
  }
};




  return (
    <div className="w-80 rounded-lg shadow h-auto p-6 bg-white relative overflow-hidden mx-auto mt-20">
      <div className="flex flex-col justify-center items-center space-y-2">
        <h2 className="text-2xl font-medium text-slate-700">Login</h2>
        <p className="text-slate-500">Enter details below.</p>
      </div>

      <form className="w-full mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-2 rounded-md">
            {error}
          </div>
        )}

        {/* Username */}
        <div>
          <input
            className="outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full focus:border-blue-300"
            placeholder="Username"
            type="text"
            {...register("username", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
            })}
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="relative w-full">
           <input
            type={showPassword ? "text" : "password"} // ✅ standard way
            className="outline-none border-2 rounded-md px-2 pr-10 py-1 text-slate-500 w-full focus:border-blue-300"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors?.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              className="mr-2 w-4 h-4"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="text-slate-500">Remember me</span>
          </div>
        </div>

        {/* Google + GitHub */}
        <div className="flex flex-col items-center gap-3 my-3">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google login failed")}
          />
          <GithubLogin />
        </div>

        <button
          className="w-full justify-center py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md text-white ring-2 disabled:bg-blue-300"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="flex justify-center space-x-1 mt-2">
          <span className="text-slate-700">Don't have an account?</span>
          <Link to="/register" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
