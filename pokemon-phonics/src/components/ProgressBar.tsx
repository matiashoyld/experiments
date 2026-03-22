'use client';

interface ProgressBarProps {
  value: number; // 0 to 1
  label?: string;
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export default function ProgressBar({
  value,
  label,
  color = '#FFD700',
  height = 16,
  showPercentage = false,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(value * 100, 0), 100);

  return (
    <div className="progress-bar-container">
      {label && <span className="progress-bar-label">{label}</span>}
      <div className="progress-bar-track" style={{ height }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            height: '100%',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      {showPercentage && (
        <span className="progress-bar-percentage">{Math.round(percentage)}%</span>
      )}
    </div>
  );
}
