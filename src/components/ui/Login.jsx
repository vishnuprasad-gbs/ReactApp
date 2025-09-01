import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useLog } from "@/context/LogContext";
import GithubLogin from "./GithubLogin";
import { useForm } from "react-hook-form";

// Normal login function
async function loginUser({ username, password }) {
  try {
    const res = await fetch(
      `http://localhost:5000/register?username=${username}&password=${password}`
    );
    const data = await res.json();

    if (data.length > 0) {
      const user = data[0];
      const logInTime = new Date().toISOString();

      await fetch("http://localhost:5000/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, logInTime }),
      });

      localStorage.setItem("user", JSON.stringify(user));
      return { success: true, user };
    } else {
      return { success: false, message: "Invalid username or password" };
    }
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, message: "Server error. Try again later." };
  }
}

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

  // Handle normal login
  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    const response = await loginUser(data);

    if (rememberMe) {
      localStorage.setItem("username", data.username);
      localStorage.setItem("password", data.password);
    } else {
      localStorage.removeItem("username");
      localStorage.removeItem("password");
    }

    if (response.success) {
      const user = response.user;

      Cookies.set("user", JSON.stringify(user), {
        expires: rememberMe ? 7 : undefined,
      });

      addLog(`${user.username} logged in`);
      window.location.href = "http://localhost:5173/home/dashboard";

    } else {
      setError(response.message);
    }
    setLoading(false);
  };

  // Handle Google login
  const handleGoogleLogin = async (credentialResponse) => {
    setError("");
    try {
      if (!credentialResponse.credential)
        throw new Error("No credentials found");

      const decoded = jwtDecode(credentialResponse.credential);
      const user = { username: decoded.name, email: decoded.email };
      const logInTime = new Date().toISOString();

      await fetch("http://localhost:5000/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, logInTime }),
      });

      Cookies.set("user", JSON.stringify(user), {
        expires: rememberMe ? 7 : undefined,
      });

      localStorage.setItem("user", JSON.stringify(user));

      addLog(`${user.username} logged in`);
      window.location.href = "http://localhost:5173/home/dashboard";

    } catch (err) {
      console.error("Google login decode error:", err);
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
          <input
            className="outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full focus:border-blue-300"
            placeholder="Password"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
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
