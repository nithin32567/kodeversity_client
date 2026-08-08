import { NavLink } from "react-router-dom";
import { NavItem } from "./types";

interface GroupProps {
  title: string;
  items: NavItem[];
  onClose?: () => void;
  isStudent?: boolean;
}

export function NavGroup({ title, items, onClose, isStudent }: GroupProps) {
  if (isStudent) {
    return (
      <div className="mt-5 lg:mt-5 px-2 lg:px-0">
        <div className="px-3 lg:px-1 mb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/70 uppercase lg:text-center">
          {title}
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((it) => (
            <div key={it.label}>
              {it.to ? (
                <NavLink
                  to={it.to}
                  onClick={onClose}
                  end
                  className={({ isActive }) =>
                    `flex lg:flex-col items-center gap-3 lg:gap-1 rounded-lg lg:rounded-xl px-3 lg:px-1 py-2.5 lg:py-2 text-sm lg:text-[10px] font-medium transition-colors hover:bg-foreground/[0.04] hover:text-foreground ${
                      isActive
                        ? "bg-primary-soft text-foreground ring-1 ring-primary/40"
                        : "text-muted-foreground"
                    }`
                  }
                >
                  <it.icon className="h-[18px] w-[18px] lg:h-5 lg:w-5 shrink-0" />
                  <span className="leading-tight lg:text-center">{it.label}</span>
                </NavLink>
              ) : (
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="w-full flex lg:flex-col items-center gap-3 lg:gap-1 rounded-lg lg:rounded-xl px-3 lg:px-1 py-2.5 lg:py-2 text-sm lg:text-[10px] font-medium text-muted-foreground transition-colors opacity-50 cursor-not-allowed text-left"
                  title="Coming soon"
                >
                  <it.icon className="h-[18px] w-[18px] lg:h-5 lg:w-5 shrink-0" />
                  <span className="leading-tight lg:text-center">{it.label}</span>
                  <span className="ml-auto lg:ml-0 lg:mt-0.5 text-[8px] font-semibold bg-white/[0.05] border border-[var(--hairline)] px-1.5 py-0.5 rounded-full text-muted-foreground/60">
                    Soon
                  </span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/70 uppercase">
        {title}
      </div>
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it.label}>
            {it.to ? (
              <NavLink
                to={it.to}
                onClick={onClose}
                className={({ isActive }) =>
                  isActive
                    ? "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white font-medium transition border-l-2 border-indigo-500 bg-white/[0.08]"
                    : "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground/75 hover:text-foreground hover:bg-white/[0.04] transition border-l-2 border-transparent"
                }
              >
                <it.icon className="h-[18px] w-[18px] opacity-80" />
                <span>{it.label}</span>
              </NavLink>
            ) : (
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground/75 hover:text-foreground hover:bg-white/[0.04] transition border-l-2 border-transparent opacity-50 cursor-not-allowed text-left"
                title="Coming soon"
              >
                <it.icon className="h-[18px] w-[18px] opacity-80" />
                <span>{it.label}</span>
                <span className="ml-auto text-[9px] font-semibold bg-white/[0.05] border border-[var(--hairline)] px-1.5 py-0.5 rounded-full text-muted-foreground/60">
                  Soon
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
