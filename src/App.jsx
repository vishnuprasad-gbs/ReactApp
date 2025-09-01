import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import Register from "./components/ui/Register";

import "./App.css";
import Home from "./pages/Home";
import Dashboard from "./components/Dashboard";

// 👇 import the LogProvider
import { LogProvider } from "./context/LogContext";
import Location from "./components/Location";
import Notification from "./components/Notification";
import { ToastContainer } from "react-toastify";

function App() {
  const user = useAuth();
  const location = useLocation();

  // 🔹 Save last visited path (only inside /home/*)
  useEffect(() => {
    if (location.pathname.startsWith("/home")) {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location]);

  // 🔹 Read last visited path
  const lastPath = localStorage.getItem("lastPath") || "/home/dashboard";

  useEffect(() => {
    console.log("User:", user);
    console.log("LastPath:", lastPath);
  }, [user]);

  return (
    <LogProvider>
      <ToastContainer />
      <Routes>
        {/* Root Route → redirect dynamically */}
        <Route
          path="/"
          element={user ? <Navigate to={lastPath} replace /> : <LoginPage />}
        />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Protected Home Routes */}
        <Route
          path="/home"
          element={user ? <Home user={user} /> : <Navigate to="/" />}
        >
          <Route path="dashboard" element={<Dashboard user={user} />} />
          <Route path="location" element={<Location user={user} />} />
          <Route path="activity" element={<Notification />} />
        </Route>
      </Routes>
    </LogProvider>
  );
}

export default App;
