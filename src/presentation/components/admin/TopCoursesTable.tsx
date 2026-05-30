import { Star, MoreVertical, ShieldAlert, Atom, TrendingUp } from "lucide-react";
import { Panel } from "./Card";

const courses = [
  {
    title: "Complete Ethical Hacking",
    author: "By Rahul Kumar",
    icon: ShieldAlert,
    grad: "linear-gradient(135deg,#1f2937,#0f172a)",
    students: "2,450",
    studentsDelta: "18%",
    enrollments: "3,782",
    enrollmentsDelta: "21%",
    revenue: "Rs. 8,45,230",
    revenueDelta: "27%",
    rating: "4.8",
    reviews: "(1.2K)",
  },
  {
    title: "Complete React Developer",
    author: "By Hitesh Sharma",
    icon: Atom,
    grad: "linear-gradient(135deg,#0891b2,#0e7490)",
    students: "3,120",
    studentsDelta: "16%",
    enrollments: "4,892",
    enrollmentsDelta: "19%",
    revenue: "Rs. 6,78,900",
    revenueDelta: "23%",
    rating: "4.9",
    reviews: "(2.1K)",
  },
];

export function TopCoursesTable() {
  return (
    <Panel
      title="Top Performing Courses"
      action={
        <a href="#" className="text-xs text-blue-400 hover:text-blue-300">
          View all
        </a>
      }
    >
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1.6fr_0.8fr_0.9fr_1fr_0.8fr_56px] text-xs text-muted-foreground px-2 pb-3 border-b border-[var(--hairline)]">
            <div>Course</div>
            <div>Students</div>
            <div>Enrollments</div>
            <div>Revenue</div>
            <div>Rating</div>
            <div className="text-right">Actions</div>
          </div>
          {courses.map((c) => (
            <div
              key={c.title}
              className="grid grid-cols-[1.6fr_0.8fr_0.9fr_1fr_0.8fr_56px] items-center px-2 py-4 border-b border-[var(--hairline)] last:border-0 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="h-11 w-11 rounded-md grid place-items-center text-white shrink-0"
                  style={{ background: c.grad }}
                >
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.author}</div>
                </div>
              </div>
              <Cell value={c.students} delta={c.studentsDelta} />
              <Cell value={c.enrollments} delta={c.enrollmentsDelta} />
              <Cell value={c.revenue} delta={c.revenueDelta} />
              <div>
                <div className="flex items-center gap-1">
                  <span className="num font-semibold text-amber-400">{c.rating}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.reviews}</div>
              </div>
              <button className="ml-auto h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.05]">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function Cell({ value, delta }: { value: string; delta: string }) {
  return (
    <div>
      <div className="num font-medium whitespace-nowrap">{value}</div>
      <div className="flex items-center gap-0.5 text-[11px] text-emerald-400 mt-0.5">
        <TrendingUp className="h-3 w-3" />
        {delta}
      </div>
    </div>
  );
}
