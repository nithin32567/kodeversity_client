/**
 * AdminLoginPage
 * Migrated from: src/routes/_auth/admin/login.tsx
 *
 * Changes from TanStack version:
 *   - Removed: createFileRoute, useNavigate from @tanstack/react-router
 *   - Added: useNavigate, useSearchParams from react-router-dom
 *   - Auth: useAppDispatch + loginThunk (Redux) instead of useAuth().login (Context)
 *   - Redirect: navigate() with string paths instead of TanStack { to } objects
 */
import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { loginThunk } from "@/features/auth/authSlice";
import { getAuthErrorMessage, UserRole } from "@/domain/auth";
import { Shield, Lock, Mail, ArrowRight } from "lucide-react";

export function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await dispatch(loginThunk({ email, password }));

      if (!loginThunk.fulfilled.match(result)) {
        const errMsg = (result.payload as Error | undefined)?.message ?? "LOGIN_FAILED";
        setError(getAuthErrorMessage(errMsg));
        return;
      }

      const user = result.payload;

      // Strict Role Validation: Must be strictly ADMIN
      if (user.role !== UserRole.ADMIN) {
        setError("Access Denied: This portal is for administrators only.");
        return;
      }

      // Successful Admin authentication: redirect to Admin dashboard
      navigate(redirectTo);
    } catch (err) {
      setError(getAuthErrorMessage((err as Error).message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(99,102,241,0.1)] relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Secure Admin Terminal
          </h1>
          <p className="text-xs text-muted-foreground max-w-[280px]">
            Authorized access only. System activity is monitored and audited.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email Address
            </span>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                id="admin-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kodeversity.com"
                className="w-full rounded-lg border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Passphrase
            </span>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                id="admin-login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {error && (
          <div
            id="admin-login-error"
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground"
          >
            <div className="mt-0.5 text-destructive">
              <Shield className="h-4 w-4" />
            </div>
            <div>{error}</div>
          </div>
        )}

        <button
          id="admin-login-submit"
          type="submit"
          disabled={busy}
          className="relative group overflow-hidden w-full h-11 rounded-lg bg-[image:var(--gradient-primary)] text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {busy ? (
            "Establishing Link..."
          ) : (
            <>
              Initialize Authentication
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <a
            href="/login"
            className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
          >
            ← Return to Student Login
          </a>
        </div>
      </form>
    </main>
  );
}
