import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/presentation/hooks/useAuth";
import { getAuthErrorMessage } from "@/domain/auth";

interface LoginSearch {
  redirect?: string;
  /** Pre-filled email when redirected here from OTP verification success. */
  verified?: string;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    verified: typeof search.verified === "string" ? search.verified : undefined,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: (search.redirect as string | undefined) ?? "/dashboard" });
    }
  },
  head: () => ({ meta: [{ title: "Sign in — Kodeversity" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [email, setEmail] = useState(search.verified ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Show a success banner when redirected from OTP verification.
  const verifiedBanner = !!search.verified;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { role } = await login(email, password);

      // Role-based routing.
      if (role === "admin") {
        void navigate({ to: "/admin" }); // swap for admin panel route when ready
      } else {
        void navigate({ to: search.redirect ?? "/" });
      }
    } catch (err) {
      const code = (err as Error).message;
      if (code === "EMAIL_NOT_VERIFIED") {
        // Redirect to register page OTP view without losing context.
        void navigate({ to: "/register", search: { email, step: "otp" } });
        return;
      }
      setError(getAuthErrorMessage(code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]"
      >
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue learning.</p>
        </div>

        {verifiedBanner && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
            ✓ Email verified! You can now sign in.
          </div>
        )}

        <label className="block text-sm">
          <span className="text-muted-foreground">Email</span>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Password</span>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        {error && (
          <p id="login-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          id="login-submit"
          type="submit"
          disabled={busy}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-primary hover:underline">
            Register
          </a>
        </p>
      </form>
    </main>
  );
}
