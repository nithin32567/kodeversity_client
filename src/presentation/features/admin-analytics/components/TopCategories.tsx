import { Panel } from "./Card";

const cats = [
  { name: "Web Development", pct: 42, grad: "var(--grad-blue)" },
  { name: "Ethical Hacking", pct: 21, grad: "var(--grad-purple)" },
  { name: "Digital Marketing", pct: 16, grad: "var(--grad-yellow)" },
  { name: "Data Science", pct: 12, grad: "var(--grad-green)" },
  { name: "Design", pct: 9, grad: "var(--grad-pink)" },
];

export function TopCategories() {
  return (
    <Panel
      title="Top Categories"
      action={
        <a href="#" className="text-xs text-blue-400 hover:text-blue-300">
          View all
        </a>
      }
    >
      <ul className="space-y-3">
        {cats.map((c) => (
          <li key={c.name}>
            <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
              <span className="min-w-0 truncate text-foreground/85">{c.name}</span>
              <span className="num text-muted-foreground">{c.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${c.pct}%`, background: c.grad }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
