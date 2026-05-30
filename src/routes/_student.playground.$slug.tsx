import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Bell,
  FlaskConical,
  RotateCcw,
  Power,
  Clock,
  Settings,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Eraser,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  List,
  LayoutGrid,
  Copy,
  CheckCircle2,
  Circle,
  Lock,
  Lightbulb,
  Eye,
  Folder,
  FileText,
  Terminal as TerminalIcon,
  KeyboardIcon,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { findCourseBySlug } from "@/presentation/components/student/courses/data";
import kodeversityLogo from "@/assets/kodeversity-logo.png";

export const Route = createFileRoute("/_student/playground/$slug")({
  loader: ({ params }) => {
    const course = findCourseBySlug(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Playground: ${loaderData?.course.title ?? "Course"} — Kodeversity` },
      { name: "description", content: `Interactive sandbox for ${loaderData?.course.title}.` },
    ],
  }),
  component: PlaygroundPage,
  errorComponent: ({ error, reset }) => (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Retry
        </button>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">
      <p>Course not found.</p>
    </div>
  ),
});

const tasks = [
  { label: "Print the current working directory", cmd: "pwd", done: true },
  { label: "List all files and directories in your home directory", cmd: "ls -la", done: true },
  { label: "Navigate to the Projects directory", cmd: "cd Projects", done: true, active: true },
  {
    label: "Create a new directory named practice inside Projects",
    cmd: "mkdir practice",
    locked: true,
  },
  {
    label: "Create an empty file named commands.txt inside practice",
    cmd: "touch practice/commands.txt",
    locked: true,
  },
];

const quickRef = [
  { cmd: "ls", desc: "List files and directories" },
  { cmd: "cd <dir>", desc: "Change directory" },
  { cmd: "pwd", desc: "Print working directory" },
  { cmd: "mkdir <dir>", desc: "Create directory" },
  { cmd: "touch <file>", desc: "Create file" },
  { cmd: "cp <src> <dest>", desc: "Copy file/directory" },
  { cmd: "mv <src> <dest>", desc: "Move/rename" },
  { cmd: "rm <file>", desc: "Remove file" },
  { cmd: "man <cmd>", desc: "Manual for command" },
];

const files = [
  { name: "..", size: "", type: "Directory", modified: "May 20 09:58", isDir: true },
  { name: "Documents", size: "4 KB", type: "Directory", modified: "May 20 10:15", isDir: true },
  { name: "Downloads", size: "4 KB", type: "Directory", modified: "May 20 10:15", isDir: true },
  { name: "Projects", size: "4 KB", type: "Directory", modified: "May 20 10:15", isDir: true },
  { name: "Scripts", size: "4 KB", type: "Directory", modified: "May 20 10:15", isDir: true },
  { name: "notes.txt", size: "120 B", type: "Text File", modified: "May 20 10:14", isDir: false },
  { name: "todo.txt", size: "98 B", type: "Text File", modified: "May 20 10:14", isDir: false },
];

function PlaygroundPage() {
  const { course } = Route.useLoaderData();
  const slug = course.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const [tab, setTab] = useState<"terminal" | "files" | "editor">("terminal");
  const [sideTab, setSideTab] = useState<"instructions" | "resources">("instructions");
  const [focusMode, setFocusMode] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* SUB BAR */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border/60 bg-background/60 px-6 py-3">
        <Link
          to="/learn/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Lesson
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Module 2: Basic Commands</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">Working with Files and Directories</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Sandbox is running
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> 00:25:18
          </span>
          <button
            onClick={() => setFocusMode((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/[0.04]"
            title={focusMode ? "Exit focus mode" : "Maximize terminal"}
          >
            {focusMode ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
            {focusMode ? "Exit Focus" : "Focus Terminal"}
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/[0.04]">
            <RotateCcw className="h-3.5 w-3.5" /> Reset Environment
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-primary)] px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-primary)] hover:opacity-90">
            <Power className="h-3.5 w-3.5" /> End Session
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden p-3">
        {/* LEFT SIDEBAR */}
        {!focusMode && (
          <aside className="order-3 hidden w-64 shrink-0 flex-col gap-3 overflow-y-auto lg:flex">
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-foreground/[0.06]">
                  🐧
                </div>
                <div>
                  <div className="text-sm font-semibold">Sandbox Environment</div>
                  <div className="text-xs text-muted-foreground">Ubuntu 22.04 LTS</div>
                </div>
              </div>
              <dl className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">User: student</dt>
                  <dd>
                    <button className="text-primary hover:underline">Change</button>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Host: linux-sandbox-7f3a</dt>
                  <dd>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Copy className="h-3 w-3" />
                    </button>
                  </dd>
                </div>
                <div className="text-muted-foreground">Uptime: 00:25:18</div>
              </dl>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold">System Overview</h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { l: "CPU", v: 12, c: "rgb(125 211 252)" },
                  { l: "Memory", v: 28, c: "rgb(74 222 128)" },
                  { l: "Disk", v: 18, c: "rgb(125 211 252)" },
                ].map((s) => (
                  <div key={s.l}>
                    <div
                      className="mx-auto grid h-14 w-14 place-items-center rounded-full"
                      style={{
                        background: `conic-gradient(${s.c} ${s.v * 3.6}deg, color-mix(in oklab, var(--foreground) 10%, transparent) 0)`,
                      }}
                    >
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-card">
                        <div className="text-[10px] text-muted-foreground">{s.l}</div>
                        <div className="text-[11px] font-bold">{s.v}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground">
                <div></div>
                <div>1.1 / 4 GB</div>
                <div>7.2 / 40 GB</div>
              </div>
            </section>
          </aside>
        )}

        {/* CENTER */}
        <section className="order-2 flex min-w-0 min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          {/* Terminal panel */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center border-b border-border/60 px-2">
              {(["terminal", "files", "editor"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative px-4 py-3 text-sm font-medium capitalize ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                  {tab === t && (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 bg-[image:var(--gradient-primary)]" />
                  )}
                </button>
              ))}
              <button className="ml-auto grid h-8 w-8 place-items-center rounded text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-[#0a0d14]/80 p-4 font-mono text-[12.5px] leading-6">
              <Line user="$" cmd="pwd" />
              <div className="text-foreground/80">/home/student</div>
              <Line user="$" cmd="ls -la" />
              <pre className="text-foreground/80">
                {`total 24
drwxr-xr-x  4 student student 4096 May 20 10:15 .
drwxr-xr-x  3 root    root    4096 May 20 09:58 ..
-rw-r--r--  1 student student  220 May 20 09:58 .bash_logout
-rw-r--r--  1 student student 3771 May 20 09:58 .bashrc
drwxr-xr-x  2 student student 4096 May 20 10:15 `}
                <span className="text-sky-400">Documents</span>
                {`
drwxr-xr-x  2 student student 4096 May 20 10:15 `}
                <span className="text-sky-400">Downloads</span>
                {`
-rw-r--r--  1 student student  807 May 20 09:58 .profile
drwxr-xr-x  2 student student 4096 May 20 10:15 `}
                <span className="text-sky-400">Projects</span>
                {`
drwxr-xr-x  2 student student 4096 May 20 10:15 `}
                <span className="text-sky-400">Scripts</span>
              </pre>
              <Line user="$" cmd="cd Projects" />
              <Line user="$" cmd="ls" />
              <div className="text-foreground/80">notes.txt todo.txt</div>
              <div className="flex items-center gap-1">
                <span className="text-emerald-400">student@linux-sandbox</span>
                <span className="text-foreground/60">:</span>
                <span className="text-sky-400">~/Projects</span>
                <span className="text-foreground/60">$</span>
                <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-foreground/70" />
              </div>
            </div>
          </div>

          {/* Files panel */}
          {!focusMode && (
            <div className="flex max-h-[220px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border/60 px-4 py-2.5 text-sm">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Files</span>
                <div className="ml-2 flex items-center gap-1 text-muted-foreground">
                  <button className="rounded p-1 hover:bg-foreground/[0.06] hover:text-foreground">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button className="rounded p-1 hover:bg-foreground/[0.06] hover:text-foreground">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <code className="rounded bg-foreground/[0.05] px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  /home/student
                </code>
                <div className="ml-auto flex items-center gap-1 text-muted-foreground">
                  <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                  <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
                    <tr className="border-b border-border/40">
                      <th className="px-4 py-2 text-left font-medium">Name</th>
                      <th className="px-4 py-2 text-left font-medium">Size</th>
                      <th className="px-4 py-2 text-left font-medium">Type</th>
                      <th className="px-4 py-2 text-left font-medium">
                        Modified <ChevronDown className="inline h-3 w-3" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((f) => (
                      <tr
                        key={f.name}
                        className="border-b border-border/30 hover:bg-foreground/[0.03]"
                      >
                        <td className="px-4 py-1.5">
                          <span
                            className={`inline-flex items-center gap-2 ${f.isDir ? "text-sky-400" : "text-foreground/80"}`}
                          >
                            {f.isDir ? (
                              <Folder className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            {f.name}
                          </span>
                        </td>
                        <td className="px-4 py-1.5 text-muted-foreground">{f.size}</td>
                        <td className="px-4 py-1.5 text-muted-foreground">{f.type}</td>
                        <td className="px-4 py-1.5 text-muted-foreground">{f.modified}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT SIDEBAR */}
        {!focusMode && (
          <aside className="order-1 hidden w-[340px] shrink-0 flex-col gap-3 overflow-y-auto xl:flex">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center border-b border-border/60 px-2">
                {(["instructions", "resources"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSideTab(t)}
                    className={`relative px-4 py-3 text-sm font-medium capitalize ${sideTab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t}
                    {sideTab === t && (
                      <span className="absolute inset-x-3 -bottom-px h-0.5 bg-[image:var(--gradient-primary)]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <h2 className="text-lg font-semibold">Working with Files and Directories</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  In this exercise, you'll practice basic Linux commands for navigating and managing
                  files.
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Tasks</h3>
                  <span className="text-xs text-muted-foreground">3 / 5 completed</span>
                </div>

                <ol className="mt-3 space-y-3">
                  {tasks.map((t, i) => (
                    <li
                      key={t.label}
                      className={`rounded-xl border p-3 ${
                        t.active
                          ? "border-primary/50 bg-primary-soft"
                          : "border-border/60 bg-background/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {t.done ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        ) : t.locked ? (
                          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        )}
                        <div className="flex-1">
                          <div
                            className={`text-sm ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}
                          >
                            {i + 1}. {t.label}
                          </div>
                          <code className="mt-2 inline-block rounded bg-foreground/[0.08] px-2 py-0.5 font-mono text-[11px] text-foreground/80">
                            {t.cmd}
                          </code>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* FOOTER BAR */}
      <footer className="flex items-center gap-4 border-t border-border/60 bg-background/80 px-6 py-3 text-xs">
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 font-medium hover:bg-foreground/[0.04]">
          <Settings className="h-3.5 w-3.5" /> Environment Settings{" "}
          <ChevronDown className="h-3 w-3" />
        </button>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />{" "}
          Connected
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 font-medium hover:bg-foreground/[0.04]">
            <KeyboardIcon className="h-3.5 w-3.5" /> Terminal Shortcuts
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 font-medium hover:bg-foreground/[0.04]">
            <MessageSquare className="h-3.5 w-3.5" /> Give Feedback
          </button>
        </div>
      </footer>
    </div>
  );
}

function Line({ user, cmd }: { user: string; cmd: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-emerald-400">student@linux-sandbox</span>
      <span className="text-foreground/60">:~{user}</span>
      <span className="text-foreground/90">{cmd}</span>
    </div>
  );
}
