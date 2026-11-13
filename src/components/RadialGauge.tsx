interface Props {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  accent?: string;
}

export default function RadialGauge({
  value,
  size = 112,
  stroke = 8,
  label,
  sublabel,
  accent = 'var(--accent)',
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div className="radial-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className="rg-track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="rg-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          stroke={accent}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="rg-center">
        <span className="rg-val num">{label ?? `${clamped}%`}</span>
        {sublabel && <span className="rg-sub mono">{sublabel}</span>}
      </div>
    </div>
  );
}

