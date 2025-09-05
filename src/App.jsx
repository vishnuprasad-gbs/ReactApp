import { useEffect, Suspense, lazy, useMemo } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import { ToastContainer } from "react-toastify";
import { LogProvider } from "./context/LogContext";

import "./App.css";

// Lazy-loaded components
const LoginPage = lazy(() => import("./pages/LoginPage"));
const Register = lazy(() => import("./components/ui/Register"));
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Location = lazy(() => import("./components/Location"));
const Notification = lazy(() => import("./components/Notification"));

function App() {
  const user = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/home")) {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location]);

  const lastPath = localStorage.getItem("lastPath") || "/home/dashboard";

  useEffect(() => {
    console.log("User:", user);
    console.log("LastPath:", lastPath);
  }, [user]);

  const memoUser = useMemo(() => user, [user]);

  return (
    <LogProvider user={memoUser}>
      <ToastContainer />

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={lastPath} replace />
            ) : (
              <Suspense fallback={<div className="text-center mt-20">Loading login...</div>}>
                <LoginPage />
              </Suspense>
            )
          }
        />

        <Route
          path="/register"
          element={
            <Suspense fallback={<div className="text-center mt-20">Loading register...</div>}>
              <Register />
            </Suspense>
          }
        />

        {/* Protected Home Routes */}
        <Route
          path="/home"
          element={
            user ? (
              <Suspense fallback={<div className="text-center mt-20">Loading home...</div>}>
                <Home user={user} />
              </Suspense>
            ) : (
              <Navigate to="/" />
            )
          }
        >
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<div className="text-center mt-20">Loading dashboard...</div>}>
                <Dashboard user={user} />
              </Suspense>
            }
          />
          <Route
            path="location"
            element={
              <Suspense fallback={<div className="text-center mt-20">Loading location...</div>}>
                <Location user={user} />
              </Suspense>
            }
          />
          <Route
            path="activity"
            element={
              <Suspense fallback={<div className="text-center mt-20">Loading notifications...</div>}>
                <Notification />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </LogProvider>
  );
}

export default App;
