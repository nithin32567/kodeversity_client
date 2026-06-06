import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Users,
  AlertCircle,
  Phone,
  GraduationCap,
  Calendar,
  BookOpen,
  RefreshCw,
  UserPlus,
  Edit2,
  ShieldOff,
  UserCheck,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import type { User } from "@/domain/user";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { CreateUserModal } from "@/presentation/features/admin-users/components/CreateUserModal";
import {
  EditUserModal,
  type EditUserPayload,
} from "@/presentation/features/admin-users/components/EditUserModal";
import {
  ActionModal,
  type ActionType,
} from "@/presentation/features/admin-users/components/ActionModal";

export interface Student extends User {
  phone?: string;
  highestQualification?: string;
  createdAt?: string;
  updatedAt?: string;
  enrolledCourses?: unknown[];
  chapterProgress?: unknown[];
}

export const Route = createFileRoute("/_auth/admin/students")({
  head: () => ({ meta: [{ title: "Student Management — Kodeversity" }] }),
  component: AdminStudentsPage,
});

export function AdminStudentsPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "SUSPENDED">("ACTIVE");
  const [students, setStudents] = useState<Student[]>([]);
  const [suspendedStudents, setSuspendedStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudentToEdit, setSelectedStudentToEdit] = useState<EditUserPayload | null>(null);

  const [actionModalState, setActionModalState] = useState<{
    isOpen: boolean;
    type: ActionType;
    userId: string;
    userName: string;
  }>({ isOpen: false, type: "SUSPEND", userId: "", userName: "" });
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const openEditModal = (student: Student) => {
    setSelectedStudentToEdit({
      id: student.id,
      name: student.name || "",
      email: student.email || "",
      role: (student.role as "STUDENT" | "INSTRUCTOR" | "ADMIN") || "STUDENT",
    });
    setIsEditModalOpen(true);
  };

  const openActionModal = (type: ActionType, student: Student) => {
    setActionModalState({
      isOpen: true,
      type,
      userId: student.id,
      userName: student.name || "Unknown User",
    });
  };

  const fetchStudents = useCallback(() => {
    if (isAuthLoading || !isAuthenticated) return;
    setIsLoading(true);
    setIsError(false);

    Promise.all([managementService.getStudents(), managementService.getSuspendedUsers()])
      .then(([activeList, suspendedList]) => {
        // filter by status from activeList if API doesn't split it, but getStudents usually returns active
        setStudents((activeList as Student[]).filter((s) => s.status !== "SUSPENDED"));
        setSuspendedStudents(
          (suspendedList as Student[]).filter(
            (s) => s.role === "STUDENT" || (s as any).role === "student"
          )
        );
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load students:", err);
        setIsError(true);
        setIsLoading(false);
      });
  }, [isAuthLoading, isAuthenticated]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleActionConfirm = async () => {
    const { type, userId } = actionModalState;
    setProcessingIds((prev) => new Set(prev).add(userId));

    try {
      if (type === "SUSPEND") {
        await managementService.updateUserStatus(userId, "SUSPENDED");
        toast.success("Account suspended successfully");
      } else if (type === "ACTIVATE") {
        await managementService.updateUserStatus(userId, "ACTIVE");
        toast.success("Account activated successfully");
      } else if (type === "DELETE") {
        await managementService.deleteUser(userId);
        toast.success("User deleted permanently");
      }
      fetchStudents();
    } catch (err) {
      console.error(`Action ${type} failed:`, err);
      toast.error(`Failed to ${type.toLowerCase()} user`);
      throw err;
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const currentList = activeTab === "ACTIVE" ? students : suspendedStudents;

  const filteredStudents = useMemo(() => {
    return currentList.filter((s) => {
      return (
        (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (s.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      );
    });
  }, [currentList, searchQuery]);

  if (isAuthLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-display">
            Student Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all registered students.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[image:var(--grad-cta)] text-sm font-semibold text-white px-4 py-2.5 shadow-md shadow-indigo-500/20 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Onboard User</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[var(--hairline)]">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "ACTIVE"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Active Students ({students.length})
        </button>
        <button
          onClick={() => setActiveTab("SUSPENDED")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "SUSPENDED"
              ? "border-rose-500 text-rose-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Suspended Accounts ({suspendedStudents.length})
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--hairline)]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 animate-pulse"
            >
              <div className="h-12 w-12 rounded-full bg-white/[0.04]" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-white/[0.04] rounded w-1/2" />
                <div className="h-3 bg-white/[0.04] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-3 animate-pulse" />
          <h3 className="font-semibold text-lg">Unable to load students</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            There was an error connecting to the authentication service.
          </p>
          <button
            onClick={fetchStudents}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-sm text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
          <Users className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="font-semibold text-lg text-foreground/80">No students match your query</h3>
          <p className="text-sm text-muted-foreground mt-1">Try resetting your search term.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => {
            const isProcessing = processingIds.has(student.id);

            return (
              <div
                key={student.id}
                className={`flex flex-col p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] transition relative ${
                  isProcessing ? "opacity-70 pointer-events-none" : "hover:bg-[var(--surface-2)]"
                }`}
              >
                {isProcessing && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-2xl backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className={`h-12 w-12 rounded-full object-cover border border-[var(--hairline)] ${activeTab === 'SUSPENDED' ? 'grayscale opacity-60' : ''}`}
                      />
                    ) : (
                      <div
                        className={`h-12 w-12 rounded-full grid place-items-center text-white text-sm font-semibold border border-[var(--hairline)] ${activeTab === 'SUSPENDED' ? 'bg-zinc-700' : ''}`}
                        style={activeTab === 'ACTIVE' ? { background: "var(--grad-purple)" } : {}}
                      >
                        {(student.name || "UN").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {activeTab === "ACTIVE" ? (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-[var(--surface)]" />
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-rose-500 ring-2 ring-[var(--surface)] flex items-center justify-center">
                        <X className="h-2.5 w-2.5 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate text-foreground">
                      {student.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                    <div className="mt-1 text-[10px] uppercase font-bold tracking-wider text-blue-400">
                      {student.role || "STUDENT"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => openEditModal(student)}
                      className="h-7 w-7 rounded-md grid place-items-center border border-[var(--hairline)] text-muted-foreground hover:text-indigo-400 hover:bg-[var(--surface-2)] transition cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {activeTab === "ACTIVE" ? (
                      <button
                        onClick={() => openActionModal("SUSPEND", student)}
                        className="h-7 w-7 rounded-md grid place-items-center border border-[var(--hairline)] text-muted-foreground hover:text-amber-500 hover:bg-[var(--surface-2)] transition cursor-pointer"
                        title="Suspend Account"
                      >
                        <ShieldOff className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => openActionModal("ACTIVATE", student)}
                        className="h-7 w-7 rounded-md grid place-items-center border border-[var(--hairline)] text-muted-foreground hover:text-emerald-500 hover:bg-[var(--surface-2)] transition cursor-pointer"
                        title="Activate Account"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-[var(--hairline)]">
                  {student.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.highestQualification && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>{student.highestQualification}</span>
                    </div>
                  )}
                  {student.createdAt && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Enrolled Courses: {student.enrolledCourses?.length || 0}</span>
                    </div>
                    
                    <button
                      onClick={() => openActionModal("DELETE", student)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-white px-2 py-1 rounded border border-rose-500/30 hover:bg-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitSuccess={fetchStudents}
        defaultRole="STUDENT"
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmitSuccess={fetchStudents}
        user={selectedStudentToEdit}
      />

      <ActionModal
        isOpen={actionModalState.isOpen}
        onClose={() => setActionModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleActionConfirm}
        actionType={actionModalState.type}
        userName={actionModalState.userName}
      />
    </main>
  );
}
