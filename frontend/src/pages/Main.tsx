import { useState, useEffect, useRef } from "react";
import axios from "axios";
import SpendCard from "../components/Counter";
import "./Main.css";

interface User {
  id: string;
  role: "A" | "Z" | "admin";
}

interface Transaction {
  player: string;
  amount: number;
  description: string;
  timestamp: string;
}

interface GameState {
  budget_a: number;
  budget_z: number;
  initial_budget: number;
  spent_a: number;
  spent_z: number;
  transactions: Transaction[];
  game_over: boolean;
  loser: string | null;
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
  const [toast, setToast] = useState("");
  const [resetBudget, setResetBudget] = useState("");
  const [showOverlay, setShowOverlay] = useState(true);
  const lastUpdatedRef = useRef<string>("");

  useEffect(() => {
    fetchState();
    const interval = setInterval(pollState, 2000);
    return () => clearInterval(interval);
  }, []);

  function authHeader() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` };
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  async function fetchState() {
    try {
      const res = await axios.get("/api/game/state", { headers: authHeader() });
      setGameState(res.data);
      lastUpdatedRef.current = res.data.last_updated;
    } catch {
      setError("Could not load game state.");
    } finally {
      setLoading(false);
    }
  }

  async function pollState() {
    try {
      const res = await axios.get("/api/game/state", { headers: authHeader() });
      if (res.data.last_updated !== lastUpdatedRef.current) {
        setGameState((prev) => {
          if (!prev?.game_over && res.data.game_over) setShowOverlay(true);
          return res.data;
        });
        lastUpdatedRef.current = res.data.last_updated;
      }
    } catch {
      // silently ignore poll errors
    }
  }

  async function handleSpend(amount: number, description: string) {
    const res = await axios.post("/api/game/spend", { amount, description }, { headers: authHeader() });
    setGameState(res.data.state);
    lastUpdatedRef.current = res.data.state.last_updated;
    showToast(`-$${amount.toFixed(2)} · ${description}`);
  }

  async function handleAdminSpend(player: "A" | "Z", amount: number, description: string) {
    const res = await axios.post(
      "/api/game/spend",
      { amount, description, player },
      { headers: authHeader() }
    );
    setGameState(res.data.state);
    lastUpdatedRef.current = res.data.state.last_updated;
    showToast(`Admin — Partner ${player}: -$${amount.toFixed(2)} · ${description}`);
  }

  async function handleReset() {
    const budget = parseFloat(resetBudget);
    const payload: any = {};
    if (!isNaN(budget) && budget > 0) payload.budget = budget;

    const res = await axios.post("/api/game/reset", payload, { headers: authHeader() });
    setGameState(res.data);
    lastUpdatedRef.current = res.data.last_updated;
    setResetBudget("");
    setShowOverlay(true);
    showToast("New round started.");
  }

  if (loading) return <div className="main-loading">Loading...</div>;
  if (!gameState) return <div className="main-error">Failed to load game.</div>;

  const { budget_a, budget_z, initial_budget, spent_a, spent_z, transactions, game_over, loser } =
    gameState;

  const totalSpent = spent_a + spent_z;
  const totalBudget = initial_budget * 2;
  const overallPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="main">
      <header className="main-header">
        <div className="header-title">
          <span className="app-name">Budget Craving</span>
          <span className="round-badge">${initial_budget.toFixed(0)} / each</span>
        </div>
        <div className="header-actions">
          <span className="logged-in-as">Partner {user.role !== "admin" ? user.role : "Admin"}</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      {toast && <div className="toast">{toast}</div>}
      {error && <div className="error-bar">{error}</div>}

      <div className="overall-section">
        <div className="overall-bar-wrap">
          <div className="overall-bar">
            <div className="overall-fill" style={{ width: `${overallPercent}%` }} />
          </div>
          <div className="overall-labels">
            <span>Combined: ${totalSpent.toFixed(2)} spent</span>
            <span>${(totalBudget - totalSpent).toFixed(2)} remaining</span>
          </div>
        </div>
      </div>

      <div className="cards-grid">
        <SpendCard
          player="A"
          budget={budget_a}
          initialBudget={initial_budget}
          spent={spent_a}
          transactions={transactions}
          canSpend={user.role === "A" || user.role === "admin"}
          disabled={game_over}
          onSpend={user.role === "admin" ? (a, d) => handleAdminSpend("A", a, d) : handleSpend}
        />
        <SpendCard
          player="Z"
          budget={budget_z}
          initialBudget={initial_budget}
          spent={spent_z}
          transactions={transactions}
          canSpend={user.role === "Z" || user.role === "admin"}
          disabled={game_over}
          onSpend={user.role === "admin" ? (a, d) => handleAdminSpend("Z", a, d) : handleSpend}
        />
      </div>

      {user.role === "admin" && (
        <div className="admin-bar">
          <input
            className="budget-input"
            type="number"
            placeholder={`Budget (default $${initial_budget})`}
            value={resetBudget}
            onChange={(e) => setResetBudget(e.target.value)}
            min="1"
            step="1"
          />
          <button className="reset-btn" onClick={handleReset}>New Round</button>
        </div>
      )}

      {game_over && showOverlay && (
        <div className="game-over-overlay">
          <div className="game-over-card">
            <button className="overlay-close-btn" onClick={() => setShowOverlay(false)} aria-label="Close">
              ✕
            </button>

            <div className="game-over-title">
              {loser === "tie" ? "It's a tie!" : `Partner ${loser} ran out first!`}
            </div>
            <p className="game-over-subtitle">
              {loser === "tie"
                ? "Both of you crave equally — impressive."
                : `Partner ${loser} is more craving.`}
            </p>

            <div className="game-over-stats">
              <div className="stat player-a-stat">
                <span className="stat-label">Partner A</span>
                <span className="stat-amount">${spent_a.toFixed(2)}</span>
                {loser === "A" && <span className="loser-tag">More Craving</span>}
                {loser === "Z" && <span className="winner-tag">Winner</span>}
              </div>
              <div className="stat-divider">vs</div>
              <div className="stat player-z-stat">
                <span className="stat-label">Partner Z</span>
                <span className="stat-amount">${spent_z.toFixed(2)}</span>
                {loser === "Z" && <span className="loser-tag">More Craving</span>}
                {loser === "A" && <span className="winner-tag">Winner</span>}
              </div>
            </div>

            {user.role === "admin" && (
              <button className="new-round-btn" onClick={handleReset}>
                Start New Round
              </button>
            )}

            <button className="overlay-logout-btn" onClick={onLogout}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}
