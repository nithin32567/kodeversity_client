import { useContext } from "react";
import { AuthContext } from "@/presentation/contexts/AuthContext";
import type { AuthState } from "@/presentation/contexts/AuthContext";

/**
 * Hook to access auth state and actions.
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
