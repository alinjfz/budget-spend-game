import { useState } from "react";
import "./Counter.css";

interface Transaction {
  player: string;
  amount: number;
  description: string;
  timestamp: string;
}

interface SpendCardProps {
  player: "A" | "Z";
  budget: number;
  initialBudget: number;
  spent: number;
  transactions: Transaction[];
  canSpend: boolean;
  disabled: boolean;
  onSpend: (amount: number, description: string) => Promise<void>;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SpendCard({
  player,
  budget,
  initialBudget,
  spent,
  transactions,
  canSpend,
  disabled,
  onSpend,
}: SpendCardProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const spentPercent = initialBudget > 0 ? (spent / initialBudget) * 100 : 0;

  const playerTransactions = transactions
    .filter((t) => t.player === player)
    .slice()
    .reverse();

  const barColor =
    spentPercent >= 90
      ? "var(--danger)"
      : spentPercent >= 60
      ? "var(--warning)"
      : "var(--success)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!description.trim()) {
      setError("Describe what you craved.");
      return;
    }

    setSubmitting(true);
    try {
      await onSpend(parsed, description.trim());
      setAmount("");
      setDescription("");
    } catch (err: any) {
      setError(err.message || "Could not add spend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`spend-card player-${player.toLowerCase()} ${disabled ? "ended" : ""}`}>
      <div className="spend-card-header">
        <span className="player-label">Partner {player}</span>
        <span className="budget-remaining" style={{ color: barColor }}>
          ${budget.toFixed(2)} left
        </span>
      </div>

      <div className="budget-bar-wrap">
        <div className="budget-bar">
          <div
            className="budget-fill"
            style={{ width: `${spentPercent}%`, background: barColor }}
          />
        </div>
        <div className="budget-bar-labels">
          <span>Spent ${spent.toFixed(2)}</span>
          <span>{Math.round(spentPercent)}%</span>
        </div>
      </div>

      {canSpend && !disabled && (
        <form className="spend-form" onSubmit={handleSubmit}>
          <div className="spend-inputs">
            <div className="amount-wrap">
              <span className="currency-sign">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                disabled={submitting}
                aria-label="Amount"
              />
            </div>
            <input
              className="description-input"
              type="text"
              placeholder="What did you crave?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              maxLength={60}
              aria-label="Description"
            />
          </div>
          {error && <p className="spend-error">{error}</p>}
          <button type="submit" className="spend-btn" disabled={submitting}>
            {submitting ? "Adding..." : "Add Spend"}
          </button>
        </form>
      )}

      {disabled && budget <= 0 && (
        <div className="out-of-budget">Budget exhausted</div>
      )}

      <div className="transaction-list">
        {playerTransactions.length === 0 ? (
          <p className="no-transactions">No purchases yet</p>
        ) : (
          playerTransactions.slice(0, 10).map((t, i) => (
            <div key={i} className="transaction-row">
              <span className="t-description">{t.description}</span>
              <div className="t-right">
                <span className="t-amount">-${t.amount.toFixed(2)}</span>
                <span className="t-time">{timeAgo(t.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
