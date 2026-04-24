import type { Contributions } from "@/lib/github";

const COLORS: Record<number, string> = {
  0: "#161b22",
  1: "#0e4429",
  2: "#006d32",
  3: "#26a641",
  4: "#39d353",
};

const CELL = 10;
const GAP = 3;
const STRIDE = CELL + GAP;

export default function ContributionGraph({ data }: { data: Contributions }) {
  const width = data.weeks.length * STRIDE;
  const height = 7 * STRIDE;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 font-mono text-[12px] md:text-[13px]">
        <span>
          <span className="text-[#7ee787] tabular-nums">{data.total30}</span>
          <span className="text-muted"> contributions · </span>
          <span className="text-[#7ee787] tabular-nums">{data.activeDays30}</span>
          <span className="text-muted"> active days · </span>
          <span className="text-[#7ee787] tabular-nums">{data.currentStreak}</span>
          <span className="text-muted"> day streak</span>
        </span>
        <span className="text-muted hidden sm:inline tabular-nums">
          {data.totalYear} this year
        </span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <svg
          role="img"
          aria-label={`GitHub contribution heatmap — ${data.totalYear} contributions in the last year, including private repositories`}
          width={width}
          height={height}
          className="block"
        >
          {data.weeks.map((week, wi) =>
            week.map((day) => {
              const weekday = new Date(day.date).getUTCDay();
              return (
                <rect
                  key={day.date}
                  x={wi * STRIDE}
                  y={weekday * STRIDE}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={COLORS[day.level]}
                >
                  <title>{`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}</title>
                </rect>
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
}
