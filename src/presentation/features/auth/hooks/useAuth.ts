/**
 * useAuth — Redux-backed hook (replaces Context-based version)
 *
 * This hook now reads from the Redux store (authSlice) instead of AuthProvider Context.
 * All existing call sites (AppShell, Sidebar, Topbar, etc.) continue to work unchanged.
 *
 * Returns the same shape as the old AuthState interface for backwards compatibility.
 * For mutations (login/logout), dispatches Redux thunks.
 */
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  logoutThunk,
} from "@/features/auth/authSlice";
import type { User } from "@/domain/user";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  logout: () => Promise<void>;
}

export function useAuth(): AuthState {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);

  const logout = async () => {
    await dispatch(logoutThunk());
  };

  return { isAuthenticated, isLoading, user, logout };
}
