import { useState, useEffect, useRef } from "react";
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
  last_updated: string;
  last_updated_by: string;
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
  const [notificationPermission, setNotificationPermission] = useState<
    "granted" | "denied" | "default"
  >(
    ("Notification" in window ? Notification.permission : "denied") as
      | "granted"
      | "denied"
      | "default"
  );
  const lastSeenUpdateRef = useRef<string>("");

  // Fetch game state only once on component mount
  useEffect(() => {
    fetchGameState();
    setupServiceWorkerListener();
    // Request notification permission on load
    requestNotificationPermissionWithBanner();

    // Poll for updates every 1 second
    const pollInterval = setInterval(pollGameState, 1000);
    return () => clearInterval(pollInterval);
  }, []);

  const fetchGameState = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/game/state", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGameState(response.data);
      lastSeenUpdateRef.current = response.data.last_updated;
      setError("");
    } catch (err: any) {
      setError("Failed to fetch game state");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pollGameState = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/game/state", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Check if game state has been updated
      if (response.data.last_updated !== lastSeenUpdateRef.current) {
        const oldState = gameState;
        setGameState(response.data);
        lastSeenUpdateRef.current = response.data.last_updated;

        // Generate notification based on what changed
        if (oldState) {
          let notificationMsg = "";
          let emoji = "😱";

          if (oldState.counter_a !== response.data.counter_a) {
            const isIncrement = response.data.counter_a > oldState.counter_a;
            const updatedBy =
              response.data.last_updated_by === "A"
                ? "User A"
                : response.data.last_updated_by === "Z"
                ? "User Z"
                : "🔧 Admin";
            emoji = isIncrement ? "📈" : "📉";
            notificationMsg = `${emoji} ${updatedBy} changed A to ${response.data.counter_a}`;
          } else if (oldState.counter_z !== response.data.counter_z) {
            const isIncrement = response.data.counter_z > oldState.counter_z;
            const updatedBy =
              response.data.last_updated_by === "A"
                ? "User A"
                : response.data.last_updated_by === "Z"
                ? "User Z"
                : "🔧 Admin";
            emoji = isIncrement ? "📈" : "📉";
            notificationMsg = `${emoji} ${updatedBy} changed Z to ${response.data.counter_z}`;
          }

          if (response.data.game_over && !oldState.game_over) {
            emoji = "🎮";
            notificationMsg = `${emoji} GAME OVER!`;
          }

          if (notificationMsg) {
            // Show in-app notification
            setNotification(notificationMsg);
            setTimeout(() => setNotification(""), 3000);

            // Show browser notification with emoji
            if (Notification.permission === "granted") {
              if (
                "serviceWorker" in navigator &&
                navigator.serviceWorker.controller
              ) {
                navigator.serviceWorker.controller.postMessage({
                  type: "SHOW_NOTIFICATION",
                  title: emoji + " Counter Tracker",
                  options: {
                    body: notificationMsg,
                    icon: "/favicon.svg",
                    badge: emoji,
                    tag: "counter-update",
                    requireInteraction: false,
                  },
                });
              } else {
                // Fallback to native notification
                new Notification(emoji + " Counter Tracker", {
                  body: notificationMsg,
                  icon: "/favicon.svg",
                });
              }
            }
          }
        }
      }
    } catch (err: any) {
      // Silently handle polling errors to avoid spam
      console.error("Poll error:", err);
    }
  };

  const requestNotificationPermissionWithBanner = async () => {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("❌ Browser does not support notifications");
      return;
    }

    console.log("🔔 Current notification permission:", Notification.permission);

    // If already granted, show confirmation
    if (Notification.permission === "granted") {
      console.log("✅ Notifications already enabled");
      setNotificationPermission("granted");
      // Show confirmation notification
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          title: "✅ Notifications Active",
          options: {
            body: "You'll receive updates for counter changes!",
            icon: "/favicon.svg",
            tag: "notif-active",
          },
        });
      }
      return;
    }

    // If already denied, show message
    if (Notification.permission === "denied") {
      console.log("❌ Notifications denied by user");
      setNotificationPermission("denied");
      setError(
        "Notifications are disabled. Allow them in browser settings to get alerts."
      );
      return;
    }

    // Request permission (default state)
    console.log("📢 Requesting notification permission...");
    try {
      const permission = await Notification.requestPermission();
      console.log("🎯 Notification permission result:", permission);
      setNotificationPermission(permission as "granted" | "denied" | "default");

      if (permission === "granted") {
        console.log("✅ Notifications enabled!");
        setError("");
        // Show test notification via service worker
        if (
          "serviceWorker" in navigator &&
          navigator.serviceWorker.controller
        ) {
          navigator.serviceWorker.controller.postMessage({
            type: "SHOW_NOTIFICATION",
            title: "🎉 Notifications Enabled",
            options: {
              body: "You'll now receive notifications for counter changes!",
              icon: "/favicon.svg",
              tag: "notif-enabled",
            },
          });
        } else {
          // Fallback if service worker not available
          new Notification("🎉 Notifications Enabled", {
            body: "You'll now receive notifications for counter changes!",
          });
        }
      } else if (permission === "denied") {
        setError(
          "Notifications denied. You won't receive alerts for counter changes."
        );
      }
    } catch (err) {
      console.error("❌ Error requesting notification permission:", err);
      setError("Could not request notification permission");
    }
  };

  const setupServiceWorkerListener = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "STATE_UPDATE") {
          const newState = event.data.payload;

          // Send token to service worker if requested
          if (event.data.type === "GET_TOKEN") {
            const token = localStorage.getItem("token");
            event.ports[0].postMessage({ type: "TOKEN_RESPONSE", token });
          }

          // Update game state from service worker
          setGameState(newState);
          lastSeenUpdateRef.current = newState.last_updated;
        }
      });

      // Register for background sync (Android PWA only)
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((registration: any) => {
          if (
            registration.sync &&
            typeof registration.sync.register === "function"
          ) {
            registration.sync.register("check-notifications").catch(() => {
              // Background sync not supported, polling will handle it
            });
          }
        });
      }
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
      lastSeenUpdateRef.current = response.data.state.last_updated;

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
      lastSeenUpdateRef.current = response.data.last_updated;
      setNotification("🔄 Game reset by admin");
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
          {notificationPermission !== "granted" && (
            <button
              onClick={requestNotificationPermissionWithBanner}
              className="notification-btn"
              title={
                notificationPermission === "denied"
                  ? "Notifications disabled"
                  : "Enable notifications"
              }
            >
              🔔{" "}
              {notificationPermission === "denied"
                ? "Notifications Off"
                : "Enable Notifications"}
            </button>
          )}
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
