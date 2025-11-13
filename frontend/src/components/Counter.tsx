import "./Counter.css";

interface CounterProps {
  label: string;
  value: number;
  maxValue: number;
  percentage: number;
  canChange: boolean;
  disabled: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function Counter({
  label,
  value,
  maxValue,
  percentage,
  canChange,
  disabled,
  onIncrement,
  onDecrement,
}: CounterProps) {
  return (
    <div className={`counter-card ${disabled ? "disabled" : ""}`}>
      <div className="counter-label">{label}</div>

      <div className="counter-display">
        <div className="counter-value">{value}</div>
        <div className="counter-max">/ {maxValue}</div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div
            className={`progress-fill ${percentage === 0 ? "empty" : ""}`}
            style={{ width: `${100 - percentage}%` }}
          />
        </div>
        <div className="progress-text">{Math.round(100 - percentage)}%</div>
      </div>

      {canChange && !disabled && (
        <div className="counter-controls">
          <button
            onClick={onDecrement}
            className="btn btn-minus"
            aria-label={`Decrease ${label}`}
          >
            −
          </button>
          <button
            onClick={onIncrement}
            className="btn btn-plus"
            aria-label={`Increase ${label}`}
          >
            +
          </button>
        </div>
      )}

      {disabled && <div className="game-over-text">GAME OVER</div>}
    </div>
  );
}
