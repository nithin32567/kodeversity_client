import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/domain/user";
import type { RegisterPayload, OtpPayload } from "@/domain/auth";
import { authService } from "@/infrastructure/auth/authService";
import { setUnauthorizedHandler, tokenStore } from "@/infrastructure/http/apiClient";
import { authStore } from "./authStore";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ role: string }>;
  logout: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ userId: string }>;
  sendOtp: (payload: OtpPayload) => Promise<{ message: string }>;
  verifyOtp: (payload: OtpPayload & { otp: string }) => Promise<{ message: string }>;
}

// Exported so hooks/useAuth.ts can import it directly.
export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bootstrapped = useRef(false);

  const clear = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clear);
    return () => setUnauthorizedHandler(null);
  }, [clear]);

  // Silently restore session on app load using httpOnly refresh cookie.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    (async () => {
      try {
        const { accessToken } = await authService.refresh();
        tokenStore.set(accessToken);
        // Validate token and get user id + role from /verify-token.
        const tokenData = await authService.verifyToken();
        // Build a minimal User object from the token payload.
        // Full profile data can be fetched lazily from user-service.
        setUser({
          id: tokenData.user.id,
          email: "",
          name: "",
          role: tokenData.user.role as User["role"],
        });
      } catch {
        clear();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clear]);

  /**
   * Logs the user in. Returns the user's role so the caller can redirect.
   * Throws with the API error code (e.g. "EMAIL_NOT_VERIFIED") on failure.
   */
  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: loggedInUser } = await authService.login({ email, password });
    tokenStore.set(accessToken);
    setUser(loggedInUser);
    return { role: loggedInUser.role };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clear();
    }
  }, [clear]);

  const register = useCallback((payload: RegisterPayload) => authService.register(payload), []);

  const sendOtp = useCallback((payload: OtpPayload) => authService.sendOtp(payload), []);

  const verifyOtp = useCallback(
    (payload: OtpPayload & { otp: string }) => authService.verifyOtp(payload),
    [],
  );

  // Sync to authStore so router beforeLoad guards can read auth state.
  useEffect(() => {
    authStore.set({ isAuthenticated: !!user, isLoading, user });
  }, [user, isLoading]);

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated: !!user,
      isLoading,
      user,
      login,
      logout,
      register,
      sendOtp,
      verifyOtp,
    }),
    [user, isLoading, login, logout, register, sendOtp, verifyOtp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** @deprecated Import useAuth from "@/presentation/hooks/useAuth" instead. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
