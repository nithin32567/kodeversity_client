import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Users,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Loader2,
  Trash2,
  X,
  Mail,
  Calendar,
  Phone,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import type { User } from "@/domain/user";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { useConfirm } from "@/presentation/global/contexts/ConfirmContext";

export function AdminInactiveUsersPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<"SUSPENDED" | "DELETED">("SUSPENDED");
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchUsers = useCallback(() => {
    if (isAuthLoading || !isAuthenticated) return;
    setIsLoading(true);
    setIsError(false);

    managementService
      .getSuspendedUsers()
      .then((users) => {
        setInactiveUsers(users);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load inactive users:", err);
        setIsError(true);
        setIsLoading(false);
      });
  }, [isAuthLoading, isAuthenticated]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRestoreUser = async (userId: string) => {
    setProcessingIds((prev) => new Set(prev).add(userId));
    try {
      await managementService.updateUserStatus(userId, "ACTIVE");
      toast.success("User restored successfully");
      fetchUsers();
    } catch (err) {
      console.error("Failed to restore user:", err);
      toast.error("Failed to restore user");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleHardDelete = async (userId: string) => {
    const isConfirmed = await confirm({
      title: "Delete User",
      message: "Are you sure you want to delete this user?",
      confirmText: "Delete",
      destructive: true
    });
    if (!isConfirmed) return;

    setProcessingIds((prev) => new Set(prev).add(userId));
    try {
      await managementService.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error("Failed to delete user");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const currentList = useMemo(() => {
    return inactiveUsers.filter((u) => u.status === activeTab);
  }, [inactiveUsers, activeTab]);

  const filteredUsers = useMemo(() => {
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
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-display">
            Inactive Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage suspended and deleted users.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[var(--hairline)]">
        <button
          onClick={() => setActiveTab("SUSPENDED")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "SUSPENDED"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Suspended ({inactiveUsers.filter((u) => u.status === "SUSPENDED").length})
        </button>
        <button
          onClick={() => setActiveTab("DELETED")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "DELETED"
              ? "border-rose-500 text-rose-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Deleted ({inactiveUsers.filter((u) => u.status === "DELETED").length})
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
          <h3 className="font-semibold text-lg">Unable to load users</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            There was an error connecting to the service.
          </p>
          <button
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-sm text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
          <Users className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="font-semibold text-lg text-foreground/80">No users match your query</h3>
          <p className="text-sm text-muted-foreground mt-1">Try resetting your search term.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((user) => {
            const isProcessing = processingIds.has(user.id);

            return (
              <div
                key={user.id}
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
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || "User"}
                        className={`h-12 w-12 rounded-full object-cover border border-[var(--hairline)] grayscale opacity-60`}
                      />
                    ) : (
                      <div
                        className={`h-12 w-12 rounded-full grid place-items-center text-white text-sm font-semibold border border-[var(--hairline)] bg-zinc-700`}
                      >
                        {(user.name || "UN").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-[var(--surface)] flex items-center justify-center ${activeTab === "SUSPENDED" ? "bg-amber-500" : "bg-rose-500"}`}
                    >
                      <X className="h-2.5 w-2.5 text-white" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate text-foreground">
                      {user.name || "No Name"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    <div className="mt-1 text-[10px] uppercase font-bold tracking-wider text-blue-400">
                      {user.role || "USER"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => handleRestoreUser(user.id)}
                      className="h-7 w-7 rounded-md grid place-items-center border border-[var(--hairline)] text-emerald-500 hover:bg-emerald-500/10 transition cursor-pointer"
                      title="Restore Account"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </button>
                    {activeTab === "SUSPENDED" && (
                      <button
                        onClick={() => handleHardDelete(user.id)}
                        className="h-7 w-7 rounded-md grid place-items-center border border-[var(--hairline)] text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
