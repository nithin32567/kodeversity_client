import { Mail, Phone, GraduationCap, Calendar } from "lucide-react";
import { MagicBentoCard } from "@/presentation/global/MagicBento";

interface ProfileHeaderProps {
  user: any;
  profileDetail: any;
  glow: string;
  onEditClick: () => void;
}

export function ProfileHeader({ user, profileDetail, glow, onEditClick }: ProfileHeaderProps) {
  return (
    <MagicBentoCard
      className="group relative flex flex-col md:flex-row gap-6 items-start md:items-center rounded-2xl border border-border bg-card p-6 md:p-10 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)] overflow-hidden"
      glowColor={glow}
      enableStars
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
          backgroundSize: "12px 12px",
        }}
      />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--accent-cyan)]/10 blur-[100px] transition-all duration-500 group-hover:bg-[var(--accent-cyan)]/25 group-hover:scale-125" />

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center w-full">
        {/* Avatar */}
        <div
          className="h-24 w-24 sm:h-28 sm:w-28 rounded-full grid place-items-center text-background text-3xl font-mono font-bold border border-white/20 shadow-[0_0_30px_var(--accent-cyan)] shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
          }}
        >
          {user?.name
            ? user.name
                .trim()
                .split(" ")
                .slice(0, 2)
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()
            : "ST"}
        </div>

        {/* User Info */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-[var(--accent-cyan)]">
                  <span className="size-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                  Role: {user?.role || "STUDENT"}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-mono">
                  {user?.name || "Student Name"}
                </h2>
              </div>
              <button
                onClick={onEditClick}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-cyan)] transition-colors hover:bg-[var(--accent-cyan)]/20"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-2 max-w-3xl pt-2 font-mono text-[10px] uppercase tracking-widest">
            <div className="flex items-center gap-3 text-muted-foreground group/item hover:text-foreground transition-colors">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] group-hover/item:bg-[var(--accent-cyan)]/20 transition-colors">
                <Mail className="h-4 w-4" />
              </div>
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground group/item hover:text-foreground transition-colors">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-violet)]/10 border border-[var(--accent-violet)]/20 text-[var(--accent-violet)] group-hover/item:bg-[var(--accent-violet)]/20 transition-colors">
                <Phone className="h-4 w-4" />
              </div>
              <span className="truncate">{profileDetail?.phone || "+91 XXXXX XXXXX"}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground group/item hover:text-foreground transition-colors">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] group-hover/item:bg-[var(--accent-cyan)]/20 transition-colors">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="truncate">
                {profileDetail?.highestQualification || "Not Specified"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground group/item hover:text-foreground transition-colors">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-violet)]/10 border border-[var(--accent-violet)]/20 text-[var(--accent-violet)] group-hover/item:bg-[var(--accent-violet)]/20 transition-colors">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="truncate">
                Registered:{" "}
                {profileDetail?.createdAt
                  ? new Date(profileDetail.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "June 2026"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </MagicBentoCard>
  );
}
