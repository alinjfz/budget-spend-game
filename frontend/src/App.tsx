import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./pages/Login";
import Main from "./pages/Main";
import Setup from "./pages/Setup";
import "./App.css";

interface User {
  id: string;
  role: "A" | "Z" | "admin";
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(
    !!localStorage.getItem("apiBase")
  );

  useEffect(() => {
    // Request notification permission on app start
    if ("Notification" in window && Notification.permission === "default") {
      console.log("📢 Requesting notification permission from App level...");
      Notification.requestPermission().then((permission) => {
        console.log("🎯 Notification permission from App:", permission);
      });
    }

    // Configure axios to use the stored API base
    const apiBase = localStorage.getItem("apiBase");
    if (apiBase) {
      axios.defaults.baseURL = apiBase;
    }

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const rememberMe = localStorage.getItem("rememberMe");

        if (token) {
          const response = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        }
      } catch (error) {
        console.log("Not authenticated");
      } finally {
        setLoading(false);
      }
    };

    if (setupComplete) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [setupComplete]);

  const handleLogin = (userData: User, token: string, rememberMe: boolean) => {
    localStorage.setItem("token", token);
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    }
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    setUser(null);
  };

  const handleSetupComplete = () => {
    setSetupComplete(true);
  };

  if (!setupComplete) {
    return <Setup onSetupComplete={handleSetupComplete} />;
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Main user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
