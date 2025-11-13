import { useState, useEffect } from "react";
import axios from "axios";
import Counter from "../components/Counter";
import "./Main.css";

interface User {
  id: string;
  role: "A" | "Z" | "admin";
}

interface GameState {
  counter_a: number;
  counter_z: number;
  max_value: number;
  game_over: boolean;
}

interface MainProps {
  user: User;
  onLogout: () => void;
}

export default function Main({ user, onLogout }: MainProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // Fetch game state only once on component mount
  useEffect(() => {
    fetchGameState();
  }, []);

  const fetchGameState = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/game/state", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGameState(response.data);
      setError("");
    } catch (err: any) {
      setError("Failed to fetch game state");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCounterChange = async (delta: number, counter?: string) => {
    if (!gameState) return;

    try {
      const token = localStorage.getItem("token");
      const payload: any = { delta };

      // Include counter field for admin
      if (user.role === "admin" && counter) {
        payload.counter = counter;
      }

      const response = await axios.post("/api/game/update", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGameState(response.data.state);

      if (response.data.notification) {
        setNotification(response.data.notification);
        setTimeout(() => setNotification(""), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Update failed");
    }
  };

  const handleReset = async () => {
    if (user.role !== "admin") {
      setError("Only admin can reset the game");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/game/reset",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGameState(response.data);
      setNotification("Game reset by admin");
      setTimeout(() => setNotification(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Reset failed");
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  if (loading) {
    return <div className="main-loading">Loading game state...</div>;
  }

  if (!gameState) {
    return <div className="main-error">Failed to load game</div>;
  }

  const percentageA = (gameState.counter_a / gameState.max_value) * 100;
  const percentageZ = (gameState.counter_z / gameState.max_value) * 100;

  return (
    <div className="main-container">
      <div className="header">
        <h1>Counter Tracker</h1>
        <div className="user-info">
          <span>
            User: <strong>{user.role.toUpperCase()}</strong>
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {notification && (
        <div className="notification-banner">{notification}</div>
      )}

      {gameState.game_over && (
        <div className="game-over-banner">🎮 GAME OVER!</div>
      )}

      <div className="counters-grid">
        <Counter
          label="A"
          value={gameState.counter_a}
          maxValue={gameState.max_value}
          percentage={percentageA}
          canChange={user.role === "A" || user.role === "admin"}
          disabled={gameState.game_over}
          onIncrement={() => handleCounterChange(1, "a")}
          onDecrement={() => handleCounterChange(-1, "a")}
        />

        <Counter
          label="Z"
          value={gameState.counter_z}
          maxValue={gameState.max_value}
          percentage={percentageZ}
          canChange={user.role === "Z" || user.role === "admin"}
          disabled={gameState.game_over}
          onIncrement={() => handleCounterChange(1, "z")}
          onDecrement={() => handleCounterChange(-1, "z")}
        />
      </div>

      {user.role === "admin" && (
        <div className="admin-controls">
          <button onClick={handleReset} className="reset-btn">
            Reset Game
          </button>
        </div>
      )}
    </div>
  );
}
