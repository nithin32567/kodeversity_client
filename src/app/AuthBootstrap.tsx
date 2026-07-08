/**
 * AuthBootstrap
 * Runs once on mount to restore the previous session and wire the 401 handler.
 * Kept in its own file so fast-refresh works correctly.
 */
import { useEffect, type ReactNode } from "react";
import { useAppDispatch } from "@/app/hooks";
import { bootstrapAuth, registerUnauthorizedHandler } from "@/features/auth/authSlice";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    registerUnauthorizedHandler(dispatch);
    void dispatch(bootstrapAuth());
  }, [dispatch]);

  return <>{children}</>;
}
