export default function PipeDiagram() {
  return (
    <div
      className="font-mono"
      role="img"
      aria-label="Architecture sketch: client to api to db to ai, with packets flowing along the pipes"
    >
      <p className="text-[10px] text-muted mb-2 select-none">
        {"// architecture.txt"}
      </p>
      <svg
        viewBox="0 0 360 64"
        className="w-full max-w-[420px] h-auto"
        preserveAspectRatio="xMinYMid meet"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="pipe-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill="var(--muted)" />
          </marker>
        </defs>

        {/* nodes */}
        <Node x={0} y={20} label="client" />
        <Node x={94} y={20} label="api" />
        <Node x={178} y={20} label="db" />
        <Node x={262} y={20} label="ai" />

        {/* pipes */}
        <line
          x1={56}
          y1={32}
          x2={94}
          y2={32}
          stroke="var(--border)"
          strokeWidth="1"
          markerEnd="url(#pipe-arrow)"
        />
        <line
          x1={138}
          y1={32}
          x2={178}
          y2={32}
          stroke="var(--border)"
          strokeWidth="1"
          markerEnd="url(#pipe-arrow)"
        />
        <line
          x1={216}
          y1={32}
          x2={262}
          y2={32}
          stroke="var(--border)"
          strokeWidth="1"
          markerEnd="url(#pipe-arrow)"
        />

        {/* packets */}
        <Packet from={56} to={94} delay="0s" />
        <Packet from={138} to={178} delay="1.1s" />
        <Packet from={216} to={262} delay="2.2s" />
      </svg>
    </div>
  );
}

function Node({ x, y, label }: { x: number; y: number; label: string }) {
  const w = 56;
  const h = 24;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill="transparent"
        stroke="var(--fg)"
        strokeWidth="1"
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 3}
        fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
        fontSize="10"
        textAnchor="middle"
        fill="var(--fg)"
      >
        {label}
      </text>
    </g>
  );
}

function Packet({
  from,
  to,
  delay,
}: {
  from: number;
  to: number;
  delay: string;
}) {
  return (
    <circle r="2.4" fill="#7ee787">
      <animate
        attributeName="cx"
        from={from}
        to={to}
        dur="2.4s"
        begin={delay}
        repeatCount="indefinite"
      />
      <animate
        attributeName="cy"
        from={32}
        to={32}
        dur="2.4s"
        begin={delay}
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.1;0.85;1"
        dur="2.4s"
        begin={delay}
        repeatCount="indefinite"
      />
    </circle>
  );
}
