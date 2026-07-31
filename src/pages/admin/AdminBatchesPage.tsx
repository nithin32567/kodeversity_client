import { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { Layers, RefreshCw, ChevronLeft, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { useConfirm } from "@/presentation/global/contexts/ConfirmContext";
import { managementService } from "@/infrastructure/admin/managementService";
import type { Batch, BatchStudent } from "@/infrastructure/admin/managementService";
import type { Course, Instructor } from "@/domain/course";
import type { User } from "@/domain/user";

import { BatchList } from "./components/batches/BatchList";
import { BatchOverviewCard } from "./components/batches/BatchOverviewCard";
import { AddStudentsPanel } from "./components/batches/AddStudentsPanel";
import { CohortRosterTable } from "./components/batches/CohortRosterTable";
import { CreateBatchModal } from "./components/batches/CreateBatchModal";
import { EditBatchModal } from "./components/batches/EditBatchModal";

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
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isAssigningInstructor, setIsAssigningInstructor] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const instructorCourseIds = useMemo(() => {
    if (!isInstructor || !user?.id) return null;
    const ids = new Set(
      courses
        .filter((c: Course) => c.instructorId === user.id || c.instructor?.id === user.id)
        .map((c: Course) => c.id),
    );
    return ids;
  }, [isInstructor, user, courses]);

  const filteredBatches = useMemo(() => {
    let pool = batches;
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

  const availableStudents = useMemo(() => {
    const rosterStudentIds = new Set(roster.map((r) => r.studentId));
    return students.filter((s) => !rosterStudentIds.has(s.id));
  }, [students, roster]);

  const filteredAvailableStudents = useMemo(() => {
    return availableStudents.filter((s) => {
      const query = studentSearchQuery.toLowerCase();
      return (
        (s.name || "").toLowerCase().includes(query) ||
        (s.email || "").toLowerCase().includes(query)
      );
    });
  }, [availableStudents, studentSearchQuery]);

  const handleCreateBatch = async (data: { name: string; code: string; startDate: string; courseId: string }) => {
    try {
      const newBatch = await managementService.createBatch({
        name: data.name,
        code: data.code,
        startDate: data.startDate,
        courseId: data.courseId || null,
      });
      toast.success(`Batch "${newBatch.name}" created successfully.`);
      setShowCreateModal(false);
      await fetchData();
    } catch (err: unknown) {
      console.error("Failed to create batch:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create batch. Ensure the code is unique.");
      throw err; // So the modal can handle it if needed
    }
  };

  const handleUpdateBatch = async (data: {
    id: string;
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    courseId: string;
    status: Batch["status"];
  }) => {
    try {
      await managementService.updateBatch(data.id, {
        name: data.name,
        code: data.code,
        startDate: data.startDate,
        endDate: data.endDate || null,
        courseId: data.courseId || null,
      });

      if (selectedBatch && selectedBatch.status !== data.status) {
        await managementService.updateBatchStatus(data.id, data.status);
      }

      toast.success("Batch updated successfully.");
      setShowEditModal(false);

      if (selectedBatch?.id === data.id) {
        setSelectedBatch((prev) =>
          prev
            ? {
              ...prev,
              name: data.name,
              code: data.code,
              startDate: data.startDate,
              endDate: data.endDate || null,
              courseId: data.courseId || null,
              status: data.status,
              course: (() => {
                if (!data.courseId) return null;
                const foundCourse = courses.find((c) => c.id === data.courseId);
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
      throw err;
    }
  };

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

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!selectedBatch) return;

    const confirmRemove = await confirm({
      title: "Remove Student",
      message: `Are you sure you want to remove ${studentName || "this student"} from "${selectedBatch.name}"?`,
      confirmText: "Remove",
      destructive: true,
    });
    if (!confirmRemove) return;

    try {
      await managementService.removeStudentFromBatch(selectedBatch.id, studentId);
      toast.success("Student removed from batch successfully.");
      await fetchRoster(selectedBatch.id);
    } catch (err: unknown) {
      console.error("Failed to remove student:", err);
      toast.error(err instanceof Error ? err.message : "Failed to remove student.");
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    const confirmDelete = await confirm({
      title: "Delete Batch",
      message: `Are you sure you want to delete batch "${batchName}"? This action cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
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
        <BatchList
          filteredBatches={filteredBatches}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectBatch={setSelectedBatch}
          onOpenCreateModal={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <BatchOverviewCard
              batch={selectedBatch}
              instructors={instructors}
              rosterCount={roster.length}
              isInstructor={isInstructor}
              isAssigningInstructor={isAssigningInstructor}
              onAssignInstructor={handleAssignInstructor}
              onEdit={() => setShowEditModal(true)}
              onToggleSuspend={() => handleToggleSuspend(selectedBatch.id, selectedBatch.status)}
              onDelete={() => handleDeleteBatch(selectedBatch.id, selectedBatch.name)}
            />
            <AddStudentsPanel
              availableStudents={filteredAvailableStudents}
              studentSearchQuery={studentSearchQuery}
              setStudentSearchQuery={setStudentSearchQuery}
              selectedStudentIds={selectedStudentIds}
              toggleStudentSelection={toggleStudentSelection}
              onEnrollStudents={handleEnrollStudents}
              isEnrolling={isEnrolling}
              onClearSelections={() => setSelectedStudentIds([])}
            />
          </div>
          <CohortRosterTable
            roster={roster}
            isRosterLoading={isRosterLoading}
            onRemoveStudent={handleRemoveStudent}
          />
        </div>
      )}

      {showCreateModal && (
        <CreateBatchModal
          courses={courses}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateBatch}
        />
      )}

      {showEditModal && selectedBatch && (
        <EditBatchModal
          batch={selectedBatch}
          courses={courses}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateBatch}
        />
      )}
    </main>
  );
}
