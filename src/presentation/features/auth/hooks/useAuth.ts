import { useContext } from "react";
import { AuthContext } from "@/presentation/features/auth/components/AuthProvider";
import type { AuthState } from "@/presentation/features/auth/components/AuthProvider";

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
