import { useState, useEffect } from "react";
import "./Setup.css";

interface SetupProps {
  onSetupComplete: () => void;
}

export default function Setup({ onSetupComplete }: SetupProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [found, setFound] = useState(false);

  useEffect(() => {
    // Try to auto-detect the server on first load
    detectServer();
  }, []);

  const detectServer = async () => {
    setConnecting(true);
    setError("");

    try {
      // Try HTTPS localhost first (development with SSL)
      const response = await fetch("https://localhost:8000/api/health", {
        method: "GET",
        mode: "no-cors",
      });

      if (response.ok || response.status === 0) {
        // Found at localhost with HTTPS
        localStorage.setItem("apiBase", "https://localhost:8000");
        setFound(true);
        setTimeout(() => onSetupComplete(), 1000);
        return;
      }
    } catch (err) {
      // HTTPS not available, try HTTP
    }

    try {
      // Try HTTP localhost (fallback)
      const response = await fetch("http://localhost:8000/api/health", {
        method: "GET",
        mode: "no-cors",
      });

      if (response.ok || response.status === 0) {
        // Found at localhost
        localStorage.setItem("apiBase", "http://localhost:8000");
        setFound(true);
        setTimeout(() => onSetupComplete(), 1000);
        return;
      }
    } catch (err) {
      // localhost not found, try .local
    }

    // Try HTTPS raspberrypi.local
    try {
      const response = await fetch(
        "https://raspberrypi.local:8000/api/health",
        {
          method: "GET",
          mode: "no-cors",
        }
      );

      if (response.ok || response.status === 0) {
        localStorage.setItem("apiBase", "https://raspberrypi.local:8000");
        setFound(true);
        setTimeout(() => onSetupComplete(), 1000);
        return;
      }
    } catch (err) {
      // HTTPS not available, try HTTP
    }

    // Try HTTP raspberrypi.local (fallback)
    try {
      const response = await fetch("http://raspberrypi.local:8000/api/health", {
        method: "GET",
        mode: "no-cors",
      });

      if (response.ok || response.status === 0) {
        localStorage.setItem("apiBase", "http://raspberrypi.local:8000");
        setFound(true);
        setTimeout(() => onSetupComplete(), 1000);
        return;
      }
    } catch (err) {
      // Not found
    }

    setError(
      "Could not find server. Make sure Raspberry Pi is running and on same WiFi network."
    );
    setConnecting(false);
  };

  const handleManualSetup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ip = formData.get("ip") as string;
    const port = formData.get("port") as string;
    const useHttps = (formData.get("protocol") as string) === "https";

    if (!ip) {
      setError("Please enter server IP or hostname");
      return;
    }

    const protocol = useHttps ? "https" : "http";
    const apiBase = `${protocol}://${ip}:${port || 8000}`;
    localStorage.setItem("apiBase", apiBase);
    setFound(true);
    setTimeout(() => onSetupComplete(), 1000);
  };

  if (found) {
    return (
      <div className="setup-container">
        <div className="setup-card success">
          <div className="setup-icon">✅</div>
          <h2>Connected!</h2>
          <p>Server found and configured</p>
          <p className="small">Loading app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1>Counter Tracker</h1>
        <p className="subtitle">First time setup</p>

        {connecting ? (
          <div className="loading-setup">
            <div className="spinner"></div>
            <p>Searching for server...</p>
            <p className="small">Make sure Raspberry Pi is running</p>
          </div>
        ) : (
          <>
            {error && <div className="error-setup">{error}</div>}

            <form onSubmit={handleManualSetup} className="setup-form">
              <h3>Enter Server Details</h3>

              <div className="form-group">
                <label>
                  Server IP or Hostname
                  <span className="hint">
                    (e.g., raspberrypi or 192.168.1.100)
                  </span>
                </label>
                <input
                  type="text"
                  name="ip"
                  placeholder="raspberrypi.local"
                  defaultValue="raspberrypi.local"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Port
                  <span className="hint">(usually 8000)</span>
                </label>
                <input
                  type="number"
                  name="port"
                  placeholder="8000"
                  defaultValue="8000"
                  min="1"
                  max="65535"
                />
              </div>

              <div className="form-group">
                <label>
                  Protocol
                  <span className="hint">(HTTPS is more secure)</span>
                </label>
                <select name="protocol" defaultValue="https">
                  <option value="https">HTTPS (Secure)</option>
                  <option value="http">HTTP (Insecure)</option>
                </select>
              </div>

              <button type="submit" className="btn-setup">
                Connect
              </button>
            </form>

            <div className="setup-help">
              <h4>Need help?</h4>
              <ul>
                <li>
                  Use hostname: <strong>raspberrypi.local:8000</strong>
                </li>
                <li>Find Pi IP: Ask network admin or check WiFi devices</li>
                <li>Make sure Raspberry Pi is powered on and running</li>
                <li>All devices must be on same WiFi network</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={detectServer}
              className="btn-retry"
              disabled={connecting}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
