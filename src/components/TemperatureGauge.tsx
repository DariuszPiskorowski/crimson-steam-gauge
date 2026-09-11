import { useId } from "react";

type Props = {
  /** value in °C */
  value: number;
  min?: number;
  max?: number;
  label?: string;
  size?: number;
};

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Full-circle instrument scale taken from an antique gear-clock dial:
 * dense minor tick ring, numbered major graduations, inner counter-scale
 * and a single needle. Rendered as glowing ember on dark glass.
 */
export function TemperatureGauge({
  value,
  min = 0,
  max = 50,
  label = "TEMP °C",
  size = 420,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const cx = 250;
  const cy = 250;

  const clamped = Math.min(max, Math.max(min, value));
  const frac = (clamped - min) / (max - min);
  // 0 sits at the bottom of the dial (6 o'clock) and the scale runs clockwise
  const OFFSET = 180;
  const needle = OFFSET + frac * 360;

  const DIV = 10; // numbered divisions around the full circle
  const MINOR = 100; // fine ticks

  const minorTicks = Array.from({ length: MINOR }, (_, i) => {
    const a = OFFSET + (360 * i) / MINOR;
    return { a, p1: polar(cx, cy, 196, a), p2: polar(cx, cy, 187, a), i };
  });

  const majorTicks = Array.from({ length: DIV }, (_, i) => {
    const a = OFFSET + (360 * i) / DIV;
    return {
      a,
      i,
      p1: polar(cx, cy, 196, a),
      p2: polar(cx, cy, 172, a),
      num: polar(cx, cy, 155, a),
      value: Math.round(min + ((max - min) * i) / DIV),
    };
  });

  // inner counter-scale (the second, smaller ring on the antique dial)
  const innerTicks = Array.from({ length: 50 }, (_, i) => {
    const a = OFFSET + (360 * i) / 50;
    const long = i % 5 === 0;
    return { a, i, p1: polar(cx, cy, 122, a), p2: polar(cx, cy, long ? 108 : 115, a), long };
  });


  const tip = polar(cx, cy, 178, needle);
  const tail = polar(cx, cy, 36, needle + 180);

  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
      role="img"
      aria-label={`${label}: ${value.toFixed(1)}`}
      className="max-w-full"
    >
      <defs>
        <radialGradient id={`halo-${uid}`}>
          <stop offset="0%" stopColor="var(--gauge-ember)" stopOpacity="0.26" />
          <stop offset="65%" stopColor="var(--gauge-ember)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--gauge-ember)" stopOpacity="0" />
        </radialGradient>
        <filter id={`glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`glowsm-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r={240} fill={`url(#halo-${uid})`} />

      {/* bezel rings */}
      <circle cx={cx} cy={cy} r={228} fill="none" stroke="var(--gauge-brass)" strokeWidth={1} opacity={0.3} />
      <circle cx={cx} cy={cy} r={214} fill="var(--gauge-glass)" stroke="var(--gauge-brass)" strokeWidth={2} opacity={0.9} />
      <circle cx={cx} cy={cy} r={204} fill="none" stroke="var(--gauge-ember)" strokeWidth={1} opacity={0.28} />

      {/* fine tick ring */}
      <g stroke="var(--gauge-tick-dim)" strokeWidth={1.3} strokeLinecap="round">
        {minorTicks.map((t) => (
          <line key={t.i} x1={t.p1.x} y1={t.p1.y} x2={t.p2.x} y2={t.p2.y} opacity={0.6} />
        ))}
      </g>

      {/* numbered graduations */}
      <g filter={`url(#glowsm-${uid})`}>
        {majorTicks.map((t) => (
          <line
            key={t.i}
            x1={t.p1.x}
            y1={t.p1.y}
            x2={t.p2.x}
            y2={t.p2.y}
            stroke="var(--gauge-ember)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      </g>
      <g style={{ fontFamily: "var(--font-tech)", fontSize: 22 }} className="fill-[var(--gauge-ember)]">
        {majorTicks.map((t) => (
          <text
            key={t.i}
            x={t.num.x}
            y={t.num.y + 8}
            textAnchor="middle"
            opacity={0.85}
          >
            {t.value}
          </text>
        ))}
      </g>

      {/* inner counter-scale */}
      <circle cx={cx} cy={cy} r={124} fill="none" stroke="var(--gauge-brass)" strokeWidth={1} opacity={0.45} />
      <g stroke="var(--gauge-ember)" strokeLinecap="round">
        {innerTicks.map((t) => (
          <line
            key={t.i}
            x1={t.p1.x}
            y1={t.p1.y}
            x2={t.p2.x}
            y2={t.p2.y}
            strokeWidth={t.long ? 2.4 : 1}
            opacity={t.long ? 0.7 : 0.35}
          />
        ))}
      </g>

      {/* needle */}
      <g filter={`url(#glow-${uid})`}>
        <line
          x1={tail.x}
          y1={tail.y}
          x2={tip.x}
          y2={tip.y}
          stroke="var(--gauge-ember-hot)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={13} fill="var(--gauge-glass)" stroke="var(--gauge-ember)" strokeWidth={3} />
        <circle cx={cx} cy={cy} r={4} fill="var(--gauge-ember-hot)" />
      </g>

      {/* readout, kept small so the scale stays the hero */}
      <text
        x={cx}
        y={cy + 86}
        textAnchor="middle"
        className="fill-[var(--gauge-ember-hot)]"
        style={{ fontFamily: "var(--font-tech)", fontSize: 30, letterSpacing: 2 }}
        filter={`url(#glowsm-${uid})`}
      >
        {value.toFixed(1)}
      </text>
      <text
        x={cx}
        y={cy - 56}
        textAnchor="middle"
        className="fill-[var(--gauge-ember)]"
        style={{ fontFamily: "var(--font-tech)", fontSize: 12, letterSpacing: 6 }}
        opacity={0.6}
      >
        {label}
      </text>
    </svg>
  );
}

export default TemperatureGauge;
