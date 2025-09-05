import axios from "axios";
import Cookies from "js-cookie";
import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { encryptData } from "../Store/authUtils";

let toast; // shared reference

async function getToast() {
  if (!toast) {
    const toastify = await import("react-toastify");
    toast = toastify.toast;
  }
  return toast;
}

const Register = () => {
  const form = useForm();
  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/register", data);
      const newUser = res.data;

      // Store user securely (localStorage + cookies)
      let users = JSON.parse(localStorage.getItem("users")) || [];
      users.push({
        ...newUser,
        password: encryptData(newUser.password),
      });
      localStorage.setItem("users", JSON.stringify(users));

      Cookies.set("currentUser", encryptData(newUser), { expires: 1 });
      Cookies.set(
        "user",
        encryptData({
          ...newUser,
          password: newUser.password,
        }),
        { expires: 7 }
      );

      // Add to activity log
      let logs = JSON.parse(localStorage.getItem("activityLog")) || [];
      logs.push({
        action: "User registered",
        user: newUser.username,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("activityLog", JSON.stringify(logs));

      const t = await getToast();
      t.success("Registration successful!");
      navigate("/home/dashboard");
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);

      const t = await getToast();
      t.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <h1 className="text-center font-extrabold">Register</h1>
          <div className="max-w-md mx-auto">
            {/* form start */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="font-semibold text-sm text-gray-600 pb-1 block">
                    Full Name *
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 mt-1 mb-1 text-sm w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    type="text"
                    placeholder="Enter your fullname"
                    {...register("fullname", { required: "Enter full name" })}
                  />
                  <p className="text-red-500 text-sm">
                    {errors.fullname?.message}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="font-semibold text-sm text-gray-600 pb-1 block">
                    Email *
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 mt-1 mb-1 text-sm w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email", {
                      required: "Enter email",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Enter a valid email address",
                      },
                    })}
                  />
                  <p className="text-red-500 text-sm">{errors.email?.message}</p>
                </div>

                {/* Username */}
                <div>
                  <label className="font-semibold text-sm text-gray-600 pb-1 block">
                    Username *
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 mt-1 mb-1 text-sm w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    type="text"
                    placeholder="Enter username"
                    {...register("username", { required: "Enter username" })}
                  />
                  <p className="text-red-500 text-sm">
                    {errors.username?.message}
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="font-semibold text-sm text-gray-600 pb-1 block">
                    Password *
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 mt-1 mb-1 text-sm w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    type="password"
                    placeholder="Enter password"
                    {...register("password", {
                      required: "Enter password",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <p className="text-red-500 text-sm">
                    {errors.password?.message}
                  </p>
                </div>
              </div>

              {/* DOB + Gender */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="font-semibold text-sm text-gray-600 pb-1 block">
                    Date of Birth
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 mt-1 mb-1 text-sm w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    type="date"
                    {...register("dob")}
                  />
                </div>

                <div>
                  <label className="font-semibold text-sm text-gray-600 pb-1 block">
                    Gender
                  </label>
                  <select
                    className="border rounded-lg px-3 py-2 mt-1 mb-1 text-sm w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    {...register("gender")}
                  >
                    <option value="">--Select--</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="mt-5">
                <button
                  disabled={isSubmitting}
                  className={`py-2 px-4 w-full text-white rounded-lg 
                    ${
                      isSubmitting
                        ? "bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  type="submit"
                >
                  {isSubmitting ? "Signing up..." : "Sign up"}
                </button>
              </div>
            </form>
            {/* form end */}

            <div className="flex items-center justify-between mt-4">
              <span className="w-1/5 border-b md:w-1/4" />
              <Link
                to={"/"}
                className="text-xs text-gray-500 uppercase hover:underline"
              >
                Have an account? Login
              </Link>
              <span className="w-1/5 border-b md:w-1/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
