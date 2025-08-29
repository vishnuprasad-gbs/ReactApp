import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { DevTool } from "@hookform/devtools";
import { toast } from "react-toastify";
import GithubLogin from "./GithubLogin";

let renderCount = 0;

const Register = () => {
  const form = useForm();
  const { register, control, handleSubmit, formState } = form;
  const { errors } = formState;
  const navigate=useNavigate()
  const onSubmit = async (data) => {
  try {
    const res = await axios.post("http://localhost:5000/register", data);

    console.log("User registered:", res.data);

    toast.success("Registration successful!");
    navigate("/"); 
  } catch (err) {
    console.error("Registration failed:", err.response?.data || err.message);
    toast.error(err.response?.data?.message || "Registration failed");
  }
};

  renderCount++;

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <h1 className="text-center  font-extrabold">Register</h1>
          <div className="max-w-md mx-auto">
            {/* form start */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label
                    className="font-semibold text-sm text-gray-600 pb-1 block"
                    htmlFor="fullname"
                  >
                    Full Name
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 mt-1 mb-1 text-sm w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    type="text"
                    id="fullname"
                    placeholder="enter your fullname"
                    {...register("fullname", { required: "Enter full name" })}
                  />
                  <p className="text-red-500 font-light text-sm">
                    {errors.fullname?.message}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label
                    className="font-semibold text-sm text-gray-600 pb-1 block"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 mt-1 mb-1 text-sm w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    type="email"
                    id="email"
                    placeholder="enter your email"
                    {...register("email", {
                      required: "Enter email",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Enter a valid email address",
                      },
                    })}
                  />
                  <p className="text-red-500 font-light text-sm">
                    {errors.email?.message}
                  </p>
                </div>

                {/* Username */}
                <div>
                  <label
                    className="font-semibold text-sm text-gray-600 pb-1 block"
                    htmlFor="username"
                  >
                    Username
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 mt-1 mb-1 text-sm w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    type="text"
                    id="username"
                    placeholder="enter username"
                    {...register("username", { required: "Enter username" })}
                  />
                  <p className="text-red-500 font-light text-sm">
                    {errors.username?.message}
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label
                    className="font-semibold text-sm text-gray-600 pb-1 block"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 mt-1 mb-1 text-sm w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    type="password"
                    id="password"
                    placeholder="enter password"
                    {...register("password", {
                      required: "Enter password",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <p className="text-red-500 font-light text-sm">
                    {errors.password?.message}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* DOB */}
                <div>
                  <label
                    className="font-semibold text-sm text-gray-600 pb-1 block"
                    htmlFor="dob"
                  >
                    Date of Birth
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 mt-1 mb-1 text-sm w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    type="date"
                    id="dob"
                    {...register("dob", { required: "Select your date of birth" })}
                  />
                  <p className="text-red-500 font-light text-sm">
                    {errors.dob?.message}
                  </p>
                </div>

                {/* Gender */}
                <div>
                  <label
                    className="font-semibold text-sm text-gray-600 pb-1 block"
                    htmlFor="gender"
                  >
                    Gender
                  </label>
                  <select
                    className="border rounded-lg px-3 py-2 mt-1 mb-1 text-sm w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    id="gender"
                    {...register("gender", { required: "Select gender" })}
                  >
                    <option value="">--Select--</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <p className="text-red-500 font-light text-sm">
                    {errors.gender?.message}
                  </p>
                </div>
              </div>
          

              {/* Submit */}
              <div className="mt-5">
                <button
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                  type="submit"
                >
                  Sign up
                </button>
              </div>
            </form>
            {/* form end */}
            
            <div className="flex items-center justify-between mt-4">
              <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4" />
              <Link
                to={"/"}
                className="text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline"
              >
                Have an account? Login
              </Link>
              <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
