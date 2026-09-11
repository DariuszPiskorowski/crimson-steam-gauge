import { useId } from "react";

type Props = {
  target: number;
  current: number;
  status?: string;
  min?: number;
  max?: number;
  size?: number;
};

const START = 135; // degrees
const SWEEP = 270;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const a = polar(cx, cy, r, from);
  const b = polar(cx, cy, r, to);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

export function TemperatureGauge({
  target,
  current,
  status = "CZUWANIE",
  min = 5,
  max = 30,
  size = 460,
}: Props) {
  const uid = useId().replace(/[:]/g, "");
  const cx = 250;
  const cy = 250;

  const pct = Math.min(1, Math.max(0, (target - min) / (max - min)));
  const angle = START + SWEEP * pct;

  // gear-clock style scale: 60 fine ticks, every 5th long
  const ticks = Array.from({ length: 61 }, (_, i) => {
    const a = START + (SWEEP * i) / 60;
    const major = i % 5 === 0;
    const rOuter = 178;
    const rInner = major ? 152 : 166;
    const p1 = polar(cx, cy, rOuter, a);
    const p2 = polar(cx, cy, rInner, a);
    const lit = i / 60 <= pct;
    return { a, major, p1, p2, lit, i };
  });

  // gear teeth ring (outer, steampunk)
  const teeth = Array.from({ length: 72 }, (_, i) => {
    const a = (360 * i) / 72;
    const p1 = polar(cx, cy, 214, a);
    const p2 = polar(cx, cy, 222, a);
    return { p1, p2, i };
  });

  const knob = polar(cx, cy, 191, angle);

  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
      role="img"
      aria-label={`Temperatura zadana ${target} stopni, aktualna ${current} stopni`}
      className="max-w-full"
    >
      <defs>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--gauge-ember)" stopOpacity="0.30" />
          <stop offset="60%" stopColor="var(--gauge-ember)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--gauge-ember)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`arc-${uid}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--gauge-ember-deep)" />
          <stop offset="55%" stopColor="var(--gauge-ember)" />
          <stop offset="100%" stopColor="var(--gauge-ember-hot)" />
        </linearGradient>
        <filter id={`soft-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`tiny-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r={230} fill={`url(#glow-${uid})`} />

      {/* brass gear teeth ring */}
      <g stroke="var(--gauge-brass)" strokeWidth={3} strokeLinecap="butt" opacity={0.5}>
        {teeth.map((t) => (
          <line key={t.i} x1={t.p1.x} y1={t.p1.y} x2={t.p2.x} y2={t.p2.y} />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={214} fill="none" stroke="var(--gauge-brass)" strokeWidth={2} opacity={0.55} />
      <circle cx={cx} cy={cy} r={205} fill="none" stroke="var(--gauge-brass)" strokeWidth={1} opacity={0.3} />

      {/* dial glass */}
      <circle cx={cx} cy={cy} r={196} fill="var(--gauge-glass)" />
      <circle cx={cx} cy={cy} r={196} fill="none" stroke="var(--gauge-brass)" strokeWidth={1.5} opacity={0.5} />

      {/* track + value arc */}
      <path
        d={arcPath(cx, cy, 191, START, START + SWEEP)}
        fill="none"
        stroke="var(--gauge-track)"
        strokeWidth={9}
        strokeLinecap="round"
      />
      <path
        d={arcPath(cx, cy, 191, START, angle)}
        fill="none"
        stroke={`url(#arc-${uid})`}
        strokeWidth={9}
        strokeLinecap="round"
        filter={`url(#soft-${uid})`}
      />

      {/* gear-clock scale */}
      <g>
        {ticks.map((t) => (
          <line
            key={t.i}
            x1={t.p1.x}
            y1={t.p1.y}
            x2={t.p2.x}
            y2={t.p2.y}
            stroke={t.lit ? "var(--gauge-ember)" : "var(--gauge-tick-dim)"}
            strokeWidth={t.major ? 3.4 : 1.6}
            strokeLinecap="round"
            opacity={t.lit ? 1 : 0.45}
            filter={t.lit && t.major ? `url(#tiny-${uid})` : undefined}
          />
        ))}
      </g>

      {/* knob */}
      <g filter={`url(#soft-${uid})`}>
        <circle cx={knob.x} cy={knob.y} r={11} fill="var(--gauge-glass)" stroke="var(--gauge-ember)" strokeWidth={3} />
        <circle cx={knob.x} cy={knob.y} r={4} fill="var(--gauge-ember-hot)" />
      </g>

      {/* readout */}
      <text
        x={cx}
        y={cy - 52}
        textAnchor="middle"
        className="fill-[var(--gauge-ember)]"
        style={{ fontSize: 17, letterSpacing: 7, fontFamily: "var(--font-tech)" }}
        opacity={0.75}
      >
        ZADANA
      </text>
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        className="fill-[var(--gauge-ember-hot)]"
        style={{ fontSize: 66, letterSpacing: 2, fontFamily: "var(--font-tech)" }}
        filter={`url(#tiny-${uid})`}
      >
        {target.toFixed(1)}
        <tspan style={{ fontSize: 24 }} dy={-26}>
          °C
        </tspan>
      </text>
      <line
        x1={cx - 70}
        y1={cy + 26}
        x2={cx + 70}
        y2={cy + 26}
        stroke="var(--gauge-ember)"
        strokeWidth={1}
        opacity={0.35}
      />
      <text
        x={cx}
        y={cy + 56}
        textAnchor="middle"
        className="fill-[var(--gauge-ember)]"
        style={{ fontSize: 20, letterSpacing: 3, fontFamily: "var(--font-tech)" }}
        opacity={0.9}
      >
        {current.toFixed(1)}°C W DOMU
      </text>
      <text
        x={cx}
        y={cy + 96}
        textAnchor="middle"
        className="fill-[var(--gauge-ember)]"
        style={{ fontSize: 13, letterSpacing: 6, fontFamily: "var(--font-tech)" }}
        opacity={0.55}
      >
        {status}
      </text>
    </svg>
  );
}

export default TemperatureGauge;
