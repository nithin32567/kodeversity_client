import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Layers,
  AlertCircle,
  Calendar,
  BookOpen,
  Plus,
  X,
  Check,
  ChevronLeft,
  ChevronDown,
  Trash2,
  Users,
  Info,
  UserMinus,
  Sparkles,
  RefreshCw,
  Clock,
  UserPlus,
  Edit2,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { managementService } from "@/infrastructure/admin/managementService";
import type { Batch, BatchStudent } from "@/infrastructure/admin/managementService";
import type { Course, Instructor } from "@/domain/course";
import type { User } from "@/domain/user";
import { toast } from "sonner";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { useConfirm } from "@/presentation/global/contexts/ConfirmContext";

export function AdminBatchesPage() {
  const { isLoading: isAuthLoading, isAuthenticated, user } = useAuth();
  const { confirm } = useConfirm();
  const isInstructor = user?.role === "INSTRUCTOR";

  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [roster, setRoster] = useState<BatchStudent[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRosterLoading, setIsRosterLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isAssigningInstructor, setIsAssigningInstructor] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Creation Form State
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formCourseId, setFormCourseId] = useState("");

  // Edit Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdatingBatch, setIsUpdatingBatch] = useState(false);
  const [editBatchId, setEditBatchId] = useState("");
  const [editFormName, setEditFormName] = useState("");
  const [editFormCode, setEditFormCode] = useState("");
  const [editFormStartDate, setEditFormStartDate] = useState("");
  const [editFormEndDate, setEditFormEndDate] = useState("");
  const [editFormCourseId, setEditFormCourseId] = useState("");
  const [editFormStatus, setEditFormStatus] = useState<Batch["status"]>("ACTIVE");

  const fetchData = useCallback(async () => {
    if (isAuthLoading || !isAuthenticated) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const [fetchedBatches, fetchedCourses, fetchedStudents, fetchedInstructors] =
        await Promise.all([
          managementService.getBatches(),
          managementService.getCourses(),
          managementService.getStudents(),
          managementService.getInstructors(),
        ]);

      setBatches(fetchedBatches);
      setCourses(fetchedCourses);
      setStudents(fetchedStudents);
      setInstructors(fetchedInstructors);
    } catch (err) {
      console.error("Failed to load Batch data:", err);
      setIsError(true);
      toast.error("Failed to load batch resources.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthLoading, isAuthenticated]);

  const fetchRoster = useCallback(async (batchId: string) => {
    setIsRosterLoading(true);
    try {
      const fetchedRoster = await managementService.getBatchRoster(batchId);
      setRoster(fetchedRoster);
    } catch (err) {
      console.error("Failed to load roster:", err);
      toast.error("Failed to load batch roster.");
    } finally {
      setIsRosterLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedBatch) {
      fetchRoster(selectedBatch.id);
      setSelectedStudentIds([]);
      setStudentSearchQuery("");
    }
  }, [selectedBatch, fetchRoster]);

  // For instructors: determine which course IDs they own
  const instructorCourseIds = useMemo(() => {
    if (!isInstructor || !user?.id) return null;
    const ids = new Set(
      courses
        .filter((c: Course) => c.instructorId === user.id || c.instructor?.id === user.id)
        .map((c: Course) => c.id),
    );
    return ids;
  }, [isInstructor, user, courses]);

  // Filter batches based on search (and role for instructors)
  const filteredBatches = useMemo(() => {
    let pool = batches;
    // Instructors only see batches tied to their own courses
    if (isInstructor && instructorCourseIds && instructorCourseIds.size > 0) {
      pool = batches.filter((b) => b.courseId && instructorCourseIds.has(b.courseId));
    }
    return pool.filter((b) => {
      const query = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(query) ||
        b.code.toLowerCase().includes(query) ||
        (b.course?.name || "").toLowerCase().includes(query)
      );
    });
  }, [batches, searchQuery, isInstructor, instructorCourseIds]);

  // Get list of students who are NOT already enrolled in the selected batch
  const availableStudents = useMemo(() => {
    const rosterStudentIds = new Set(roster.map((r) => r.studentId));
    return students.filter((s) => !rosterStudentIds.has(s.id));
  }, [students, roster]);

  // Filter available students based on search input
  const filteredAvailableStudents = useMemo(() => {
    return availableStudents.filter((s) => {
      const query = studentSearchQuery.toLowerCase();
      return (
        (s.name || "").toLowerCase().includes(query) ||
        (s.email || "").toLowerCase().includes(query)
      );
    });
  }, [availableStudents, studentSearchQuery]);

  // Create Batch Submit handler
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCode || !formStartDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsCreatingBatch(true);
    try {
      const newBatch = await managementService.createBatch({
        name: formName,
        code: formCode,
        startDate: formStartDate,
        courseId: formCourseId || null,
      });

      toast.success(`Batch "${newBatch.name}" created successfully.`);
      setShowCreateModal(false);

      // Reset form
      setFormName("");
      setFormCode("");
      setFormStartDate("");
      setFormCourseId("");

      // Refresh data
      await fetchData();
    } catch (err: unknown) {
      console.error("Failed to create batch:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to create batch. Ensure the code is unique.",
      );
    } finally {
      setIsCreatingBatch(false);
    }
  };

  // Bulk enrollment handler
  const handleEnrollStudents = async () => {
    if (!selectedBatch) return;
    if (selectedStudentIds.length === 0) {
      toast.error("Please select at least one student to enroll.");
      return;
    }

    setIsEnrolling(true);
    try {
      const updatedRoster = await managementService.addStudentsToBatch(
        selectedBatch.id,
        selectedStudentIds,
      );
      setRoster(updatedRoster);
      setSelectedStudentIds([]);
      setStudentSearchQuery("");
      toast.success(`Successfully enrolled ${selectedStudentIds.length} student(s).`);
    } catch (err: unknown) {
      console.error("Failed to enroll students:", err);
      toast.error(err instanceof Error ? err.message : "Failed to enroll students.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleAssignInstructor = async (instructorId: string) => {
    if (!selectedBatch) return;
    setIsAssigningInstructor(true);
    try {
      const updatedBatch = await managementService.assignInstructorToBatch(
        selectedBatch.id,
        instructorId || null,
      );
      toast.success("Instructor assigned successfully.");
      setSelectedBatch((prev) => (prev ? { ...prev, instructorId: instructorId || null } : null));
      await fetchData();
    } catch (err: unknown) {
      console.error("Failed to assign instructor:", err);
      toast.error(err instanceof Error ? err.message : "Failed to assign instructor.");
    } finally {
      setIsAssigningInstructor(false);
    }
  };

  // Remove student handler
  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!selectedBatch) return;

    const confirmRemove = await confirm({
      title: "Remove Student",
      message: `Are you sure you want to remove ${studentName || "this student"} from "${selectedBatch.name}"?`,
      confirmText: "Remove",
      destructive: true
    });
    if (!confirmRemove) return;

    try {
      await managementService.removeStudentFromBatch(selectedBatch.id, studentId);
      toast.success("Student removed from batch successfully.");
      // Refresh roster
      await fetchRoster(selectedBatch.id);
    } catch (err: unknown) {
      console.error("Failed to remove student:", err);
      toast.error(err instanceof Error ? err.message : "Failed to remove student.");
    }
  };

  // Toggle selection for a student
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const openEditModal = (batch: Batch) => {
    setEditBatchId(batch.id);
    setEditFormName(batch.name);
    setEditFormCode(batch.code);
    setEditFormStartDate(new Date(batch.startDate).toISOString().split("T")[0]);
    setEditFormEndDate(batch.endDate ? new Date(batch.endDate).toISOString().split("T")[0] : "");
    setEditFormCourseId(batch.courseId || "");
    setEditFormStatus(batch.status);
    setShowEditModal(true);
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormName || !editFormCode || !editFormStartDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsUpdatingBatch(true);
    try {
      await managementService.updateBatch(editBatchId, {
        name: editFormName,
        code: editFormCode,
        startDate: editFormStartDate,
        endDate: editFormEndDate || null,
        courseId: editFormCourseId || null,
      });

      if (selectedBatch && selectedBatch.status !== editFormStatus) {
        await managementService.updateBatchStatus(editBatchId, editFormStatus);
      }

      toast.success("Batch updated successfully.");
      setShowEditModal(false);

      if (selectedBatch?.id === editBatchId) {
        setSelectedBatch((prev) =>
          prev
            ? {
                ...prev,
                name: editFormName,
                code: editFormCode,
                startDate: editFormStartDate,
                endDate: editFormEndDate || null,
                courseId: editFormCourseId || null,
                status: editFormStatus,
                course: (() => {
                  if (!editFormCourseId) return null;
                  const foundCourse = courses.find((c) => c.id === editFormCourseId);
                  return foundCourse ? { name: foundCourse.title } : prev.course;
                })(),
              }
            : null,
        );
      }

      await fetchData();
    } catch (err: unknown) {
      console.error("Failed to update batch:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update batch.");
    } finally {
      setIsUpdatingBatch(false);
    }
  };

  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    const confirmDelete = await confirm({
      title: "Delete Batch",
      message: `Are you sure you want to delete batch "${batchName}"? This action cannot be undone.`,
      confirmText: "Delete",
      destructive: true
    });
    if (!confirmDelete) return;

    try {
      await managementService.deleteBatch(batchId);
      toast.success("Batch deleted successfully.");
      if (selectedBatch?.id === batchId) {
        setSelectedBatch(null);
      }
      await fetchData();
    } catch (err: unknown) {
      console.error("Failed to delete batch:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete batch.");
    }
  };

  const handleToggleSuspend = async (batchId: string, currentStatus: string) => {
    const newStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      await managementService.updateBatchStatus(batchId, newStatus);
      toast.success(`Batch ${newStatus.toLowerCase()} successfully.`);
      if (selectedBatch?.id === batchId) {
        setSelectedBatch((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      await fetchData();
    } catch (err: unknown) {
      console.error("Failed to change batch status:", err);
      toast.error(err instanceof Error ? err.message : "Failed to change batch status.");
    }
  };

  // Get status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Upcoming
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-muted-foreground border border-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            Completed
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-muted-foreground border border-white/10">
            {status}
          </span>
        );
    }
  };

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
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-[var(--hairline)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span
              className="hover:text-foreground cursor-pointer transition"
              onClick={() => setSelectedBatch(null)}
            >
              Admin panel
            </span>
            <span>&gt;</span>
            <span className="text-foreground font-medium">Batches</span>
            {selectedBatch && (
              <>
                <span>&gt;</span>
                <span className="text-blue-400 font-semibold">{selectedBatch.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-display flex items-center gap-3">
            <Layers className="h-7 w-7 text-blue-400" />
            {selectedBatch ? "Manage Batch" : "Batch Management"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedBatch
              ? `Manage student roster and details for cohort "${selectedBatch.name}".`
              : "Create learning cohorts, map them to courses, and assign students in bulk."}
          </p>
        </div>

        {/* Buttons / Actions */}
        <div className="flex items-center gap-3">
          {selectedBatch ? (
            <button
              onClick={() => setSelectedBatch(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/80 text-sm text-foreground hover:bg-[var(--surface)] hover:text-white transition duration-200 shadow-md cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Batches
            </button>
          ) : (
            <>
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="p-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-muted-foreground hover:text-foreground transition disabled:opacity-50 cursor-pointer"
                title="Refresh Batches"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              {/* Only admins can create batches */}
              {!isInstructor && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary)] hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Create New Batch
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 animate-pulse space-y-4"
            >
              <div className="h-6 bg-white/[0.04] rounded w-2/3" />
              <div className="h-4 bg-white/[0.04] rounded w-1/2" />
              <div className="h-8 bg-white/[0.04] rounded w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center max-w-2xl mx-auto">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-3 animate-pulse" />
          <h3 className="font-semibold text-lg text-foreground">Unable to load batches</h3>
          <p className="text-sm text-muted-foreground mt-2">
            There was an error communicating with the course microservice. Please check that the
            server is online and try again.
          </p>
          <button
            onClick={fetchData}
            className="mt-5 px-5 py-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-sm text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : !selectedBatch ? (
        <div className="space-y-6">
          {}
          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--hairline)]">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batches by name, code, or course..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {}
          {filteredBatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
              <Layers className="h-12 w-12 text-muted-foreground/45 mb-3" />
              <h3 className="font-semibold text-lg text-foreground/80">No batches found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? "Try resetting your search filter."
                  : "Create your first batch to start enrolling students."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 text-sm transition cursor-pointer"
                >
                  Create Batch Now
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex flex-col p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/50 transition duration-300 group shadow-lg"
                >
                  {}
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[17px] text-foreground truncate group-hover:text-blue-400 transition">
                        {batch.name}
                      </h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-mono bg-white/[0.04] text-muted-foreground rounded border border-[var(--hairline)]">
                        {batch.code}
                      </span>
                    </div>
                    {getStatusBadge(batch.status)}
                  </div>

                  {}
                  <div className="space-y-2.5 mt-5 flex-1 border-t border-b border-[var(--hairline)] py-4 my-4">
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <BookOpen className="h-4 w-4 text-blue-400/80 shrink-0" />
                      <span className="truncate text-foreground/90 font-medium">
                        {batch.course?.name || "General Study Batch"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Calendar className="h-4 w-4 text-purple-400/80 shrink-0" />
                      <span>
                        Starts:{" "}
                        {new Date(batch.startDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {batch.endDate && (
                      <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4 text-amber-400/80 shrink-0" />
                        <span>
                          Ends:{" "}
                          {new Date(batch.endDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {}
                  <button
                    onClick={() => setSelectedBatch(batch)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-sm font-semibold text-blue-400 hover:text-blue-300 transition cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    Manage Cohort
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {}
          <div className="lg:col-span-5 space-y-6">
            {}
            <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] space-y-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full blur-2xl" />

              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground font-display">
                    {selectedBatch.name}
                  </h3>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-mono bg-white/[0.04] text-muted-foreground rounded-lg border border-[var(--hairline)]">
                    Code: {selectedBatch.code}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(selectedBatch.status)}
                  {!isInstructor && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => openEditModal(selectedBatch)}
                        className="p-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-muted-foreground hover:text-blue-400 transition"
                        title="Edit Batch"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleSuspend(selectedBatch.id, selectedBatch.status)}
                        className="p-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-muted-foreground hover:text-amber-400 transition"
                        title={
                          selectedBatch.status === "SUSPENDED" ? "Activate Batch" : "Suspend Batch"
                        }
                      >
                        {selectedBatch.status === "SUSPENDED" ? (
                          <PlayCircle className="h-4 w-4" />
                        ) : (
                          <PauseCircle className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(selectedBatch.id, selectedBatch.name)}
                        className="p-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-muted-foreground hover:text-rose-400 transition"
                        title="Delete Batch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-[var(--hairline)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-emerald-400 shrink-0" />
                    Instructor
                  </span>
                  {!isInstructor ? (
                    <div className="relative">
                      <select
                        value={selectedBatch.instructorId || ""}
                        onChange={(e) => handleAssignInstructor(e.target.value)}
                        disabled={isAssigningInstructor}
                        className="pl-3 pr-8 py-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-xs focus:outline-none focus:border-blue-500 transition text-foreground appearance-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="">Unassigned</option>
                        {instructors.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                    </div>
                  ) : (
                    <span className="font-semibold text-foreground">
                      {instructors.find((i) => i.id === selectedBatch.instructorId)?.name ||
                        "Unassigned"}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-400 shrink-0" />
                    Course
                  </span>
                  <span className="font-semibold text-foreground max-w-[200px] truncate text-right">
                    {selectedBatch.course?.name || "General Study Batch"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400 shrink-0" />
                    Start Date
                  </span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedBatch.startDate).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>
                {selectedBatch.endDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                      End Date
                    </span>
                    <span className="font-medium text-foreground">
                      {new Date(selectedBatch.endDate).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-400 shrink-0" />
                    Current Roster
                  </span>
                  <span className="font-bold text-foreground font-mono bg-white/[0.04] px-2 py-0.5 rounded border border-[var(--hairline)]">
                    {roster.length} student{roster.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>

            {}
            <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] space-y-4 shadow-lg">
              <div>
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-emerald-400" />
                  Add Students to Batch
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Select unregistered students from the active database to enroll in bulk.
                </p>
              </div>

              {}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Filter students by name/email..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {}
              <div className="border border-[var(--hairline)] rounded-lg bg-[var(--surface-2)]/30 max-h-[220px] overflow-y-auto p-2 space-y-1 scrollbar-thin">
                {filteredAvailableStudents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    {studentSearchQuery
                      ? "No matching students found."
                      : "All registered students are enrolled."}
                  </div>
                ) : (
                  filteredAvailableStudents.map((student) => {
                    const isSelected = selectedStudentIds.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        onClick={() => toggleStudentSelection(student.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition select-none ${
                          isSelected
                            ? "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                            : "hover:bg-[var(--surface-2)] border border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition ${
                            isSelected
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "border-muted-foreground/50 bg-[var(--surface)]"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3px]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">
                            {student.name || "Unnamed Student"}
                          </div>
                          <div className="text-[10px] opacity-70 truncate">{student.email}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Selected:{" "}
                  <span className="font-bold text-foreground font-mono">
                    {selectedStudentIds.length}
                  </span>
                </span>
                {selectedStudentIds.length > 0 && (
                  <button
                    onClick={() => setSelectedStudentIds([])}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition underline cursor-pointer"
                  >
                    Clear Selections
                  </button>
                )}
              </div>

              <button
                onClick={handleEnrollStudents}
                disabled={selectedStudentIds.length === 0 || isEnrolling}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
              >
                {isEnrolling ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Enrolling Students...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Enroll Selected Students
                  </>
                )}
              </button>
            </div>
          </div>

          {}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--hairline)]">
              <div>
                <h3 className="font-semibold text-lg text-foreground font-display flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" />
                  Cohort Roster
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Currently active students in this learning cohort.
                </p>
              </div>
              <span className="px-2.5 py-1 text-xs font-mono bg-white/[0.04] text-muted-foreground rounded-lg border border-[var(--hairline)]">
                Total: {roster.length}
              </span>
            </div>

            {isRosterLoading ? (
              <div className="py-12 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4 items-center animate-pulse py-2">
                    <div className="h-10 w-10 rounded-full bg-white/[0.04]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-white/[0.04] rounded w-1/3" />
                      <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : roster.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <h4 className="font-semibold text-foreground/80">Roster is empty</h4>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  No students assigned to this batch yet. Use the left panel checklist tool to
                  select and enroll active students.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-[var(--hairline)]">
                      <th className="py-3 font-semibold">Student</th>
                      <th className="py-3 px-4 font-semibold">Enrolled On</th>
                      <th className="py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--hairline)]">
                    {roster.map((r) => (
                      <tr key={r.id} className="group hover:bg-[var(--surface-2)]/30 transition">
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-3">
                            {r.student.avatarUrl ? (
                              <img
                                src={r.student.avatarUrl}
                                alt={r.student.name || ""}
                                className="h-9 w-9 rounded-full object-cover border border-[var(--hairline)]"
                              />
                            ) : (
                              <div
                                className="h-9 w-9 rounded-full grid place-items-center text-white text-[11px] font-semibold border border-[var(--hairline)]"
                                style={{ background: "var(--grad-purple)" }}
                              >
                                {(r.student.name || "ST").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-foreground truncate max-w-[200px]">
                                {r.student.name || "Unnamed Student"}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                {r.student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {new Date(r.joinedAt).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() =>
                              handleRemoveStudent(r.studentId, r.student.name || r.student.email)
                            }
                            className="p-2 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
                            title="Remove student from batch"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          {}
          <div className="relative w-full max-w-md p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-2xl space-y-5 animate-scale-in">
            {}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground font-display flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-400" />
                  Create New Batch
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Fill in the cohort parameters to initialize the batch mapping.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-muted-foreground hover:text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {}
            <form onSubmit={handleCreateBatch} className="space-y-4">
              {}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Fullstack Web June Cohort"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 transition text-foreground"
                />
              </div>

              {}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Unique Batch Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., FS-WEB-JUN-2026"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 transition text-foreground font-mono"
                />
              </div>

              {}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Select Course
                  <span className="ml-1 text-muted-foreground/50 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground appearance-none cursor-pointer"
                  >
                    <option value="">None / General Study Batch</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-sm font-semibold text-foreground hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBatch}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCreatingBatch ? "Creating..." : "Save Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          {}
          <div className="relative w-full max-w-md p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-2xl space-y-5 animate-scale-in">
            {}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground font-display flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-blue-400" />
                  Edit Batch
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Update the batch details and settings.
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-muted-foreground hover:text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {}
            <form onSubmit={handleUpdateBatch} className="space-y-4">
              {}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Fullstack Web June Cohort"
                  value={editFormName}
                  onChange={(e) => setEditFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 transition text-foreground"
                />
              </div>

              {}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Unique Batch Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., FS-WEB-JUN-2026"
                  value={editFormCode}
                  onChange={(e) => setEditFormCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 transition text-foreground font-mono"
                />
              </div>

              {}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Start Date *</label>
                <input
                  type="date"
                  required
                  value={editFormStartDate}
                  onChange={(e) => setEditFormStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground"
                />
              </div>

              {}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">End Date</label>
                <input
                  type="date"
                  value={editFormEndDate}
                  onChange={(e) => setEditFormEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Select Course
                  <span className="ml-1 text-muted-foreground/50 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={editFormCourseId}
                    onChange={(e) => setEditFormCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground appearance-none cursor-pointer"
                  >
                    <option value="">None / General Study Batch</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Status *</label>
                <div className="relative">
                  <select
                    required
                    value={editFormStatus}
                    onChange={(e) => setEditFormStatus(e.target.value as Batch["status"])}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground appearance-none cursor-pointer"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-sm font-semibold text-foreground hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingBatch}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUpdatingBatch ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
