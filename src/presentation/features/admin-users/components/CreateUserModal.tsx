import React, { useState, useEffect } from "react";
import { X, UserPlus, Mail, User, ShieldAlert, ChevronDown } from "lucide-react";
import axios, { AxiosError } from "axios";
import { tokenStore } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";
import { toast } from "sonner";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
  defaultRole?: "STUDENT" | "INSTRUCTOR";
}

export function CreateUserModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  defaultRole = "STUDENT",
}: CreateUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRole(defaultRole);
      setName("");
      setEmail("");
      setValidationError(null);
    }
  }, [isOpen, defaultRole]);

  if (!isOpen) return null;

  const handleValidation = (): boolean => {
    setValidationError(null);

    if (!name.trim()) {
      setValidationError("Full Name is required.");
      return false;
    }

    if (!email.trim()) {
      setValidationError("Email Address is required.");
      return false;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!handleValidation()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = tokenStore.get();
      const response = await axios.post(
        endpoints.admin.createUser,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          withCredentials: true,
        },
      );

      const payload = response.data;
      if (payload && payload.success === false) {
        throw new Error(payload.error || payload.message || "Failed to create user.");
      }

      toast.success("User created successfully! Login credentials sent to their email.");
      onSubmitSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.error("User creation failed:", err);
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      const responseData = axiosErr.response?.data;
      const errMsg =
        responseData?.message ||
        responseData?.error ||
        (typeof responseData === "string" ? responseData : null) ||
        (err instanceof Error ? err.message : "Failed to create user.");
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      {}
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col">
        {}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--hairline)] bg-[var(--surface-2)]/60">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold font-display text-foreground">Onboard New User</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-lg border border-[var(--hairline)] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {}
          {validationError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setValidationError(null);
                }}
                placeholder="e.g. Jane Doe"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition text-foreground"
              />
            </div>
          </div>

          {}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationError(null);
                }}
                placeholder="e.g. jane.doe@example.com"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition text-foreground"
              />
            </div>
          </div>

          {}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Role Assignment
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "STUDENT" | "INSTRUCTOR")}
                className="w-full appearance-none px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-indigo-500 transition cursor-pointer text-foreground"
              >
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {}
          <div className="flex flex-col gap-3 pt-3 border-t border-[var(--hairline)]">
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center p-3 text-center space-y-2.5">
                <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-indigo-400 font-medium animate-pulse">
                  Registering user and sending secure credentials via email...
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--hairline)] hover:bg-white/[0.04] active:scale-[0.98] transition cursor-pointer text-foreground bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-[image:var(--grad-cta)] text-white hover:opacity-95 active:scale-[0.98] transition flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Onboard User</span>
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
