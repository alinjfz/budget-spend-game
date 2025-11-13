import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./pages/Login";
import Main from "./pages/Main";
import "./App.css";

interface User {
  id: string;
  role: "A" | "Z" | "admin";
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    checkAuth();
  }, []);

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
