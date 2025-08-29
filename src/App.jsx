import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import Register from "./components/ui/Register";

import ActivityLog from "./components/ActivityLog";
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

  useEffect(() => {
    console.log("User:", user);
  }, [user]);

  return (
   
    <LogProvider>
      
        <ToastContainer />
     <Routes>
  
  <Route
    path="/"
    element={user ? <Navigate to="/home/dashboard" /> : <LoginPage />}
  />


  <Route path="/register" element={<Register />} />

  
  <Route
    path="/home"
    element={user ? <Home user={user} /> : <Navigate to="/" />}
  >
   
    <Route path="dashboard" element={<Dashboard user={user}/>} />
    <Route path="location" element={<Location user={user} />} />
    <Route path="activity" element={<Notification />} />

   
    <Route index element={<Navigate to="dashboard" />} />
  </Route>
</Routes>

    </LogProvider>
  );
}

export default App;
