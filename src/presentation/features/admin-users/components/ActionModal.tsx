import React, { useState, useEffect } from "react";
import { X, AlertTriangle, ShieldAlert } from "lucide-react";

export type ActionType = "SUSPEND" | "ACTIVATE" | "DELETE";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  actionType: ActionType;
  userName: string;
}

export function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  userName,
}: ActionModalProps) {
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDeleteConfirmText("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDelete = actionType === "DELETE";
  const isSuspend = actionType === "SUSPEND";
  const isActivate = actionType === "ACTIVATE";

  const handleConfirm = async () => {
    if (isDelete && deleteConfirmText !== "DELETE") {
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      // Error is handled by caller
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = isDelete
    ? "Delete User"
    : isSuspend
    ? "Suspend User"
    : "Activate User";

  const description = isDelete
    ? "This action is permanent and cannot be undone."
    : isSuspend
    ? "Are you sure you want to suspend this user? They will lose immediate access to the platform."
    : "Are you sure you want to activate this user? They will regain access to the platform.";

  const buttonText = isDelete
    ? "Delete Permanently"
    : isSuspend
    ? "Suspend Account"
    : "Activate Account";

  const Icon = isDelete ? ShieldAlert : AlertTriangle;
  const iconColor = isDelete ? "text-rose-500" : isSuspend ? "text-amber-500" : "text-emerald-500";
  const buttonClass = isDelete
    ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20"
    : isSuspend
    ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20"
    : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--hairline)] bg-[var(--surface-2)]/60">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <h2 className="text-lg font-semibold font-display text-foreground">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-lg border border-[var(--hairline)] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
            <br />
            <span className="font-semibold text-foreground mt-2 block">User: {userName}</span>
          </p>

          {isDelete && (
            <div className="space-y-1.5 mt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 rounded-lg border border-rose-500/30 bg-[var(--surface-2)] text-sm focus:outline-none focus:border-rose-500 transition text-foreground placeholder:text-muted-foreground/30"
              />
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 border-t border-[var(--hairline)]">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--hairline)] hover:bg-white/[0.04] active:scale-[0.98] transition cursor-pointer text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting || (isDelete && deleteConfirmText !== "DELETE")}
                className={`px-5 py-2 text-sm font-semibold rounded-lg active:scale-[0.98] transition flex items-center justify-center min-w-[140px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{buttonText}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
