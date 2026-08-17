
import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { loginThunk, googleLoginThunk } from "@/features/auth/authSlice";
import { getAuthErrorMessage, UserRole } from "@/domain/auth";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get("redirect") ?? "/student/dashboard";
  const verifiedEmail = searchParams.get("verified") ?? "";

  const [email, setEmail] = useState(verifiedEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const verifiedBanner = !!verifiedEmail;

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setBusy(true);
      setError(null);
      try {
        const result = await dispatch(googleLoginThunk({ code: codeResponse.code }));
        if (!googleLoginThunk.fulfilled.match(result)) {
          const errMsg = (result.payload as Error | undefined)?.message ?? "LOGIN_FAILED";
          setError(getAuthErrorMessage(errMsg));
          return;
        }

        const user = result.payload;
        console.log("Email sent response:", (result.payload as any)?.emailResponse || "No email sent (not a new user)");
        
        if (user.role === UserRole.ADMIN) {
          setError("Admins must use the secure admin portal to log in.");
          return;
        }

        if (user.role === UserRole.INSTRUCTOR) {
          navigate("/instructor/dashboard");
        } else {
          navigate(redirectTo);
        }
      } catch (err) {
        setError(getAuthErrorMessage((err as Error).message));
      } finally {
        setBusy(false);
      }
    },
    flow: "auth-code",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await dispatch(loginThunk({ email, password }));

      if (!loginThunk.fulfilled.match(result)) {
        const errMsg = (result.payload as Error | undefined)?.message ?? "LOGIN_FAILED";
        if (errMsg === "EMAIL_NOT_VERIFIED") {
          navigate(`/register?email=${encodeURIComponent(email)}&step=otp`);
          return;
        }
        setError(getAuthErrorMessage(errMsg));
        return;
      }

      const user = result.payload;

      // Block Admins from the student login page
      if (user.role === UserRole.ADMIN) {
        setError("Admins must use the secure admin portal to log in.");
        return;
      }

      // Role-based redirect
      if (user.role === UserRole.INSTRUCTOR) {
        navigate("/instructor/dashboard");
      } else {
        navigate(redirectTo);
      }
    } catch (err) {
      setError(getAuthErrorMessage((err as Error).message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand/8 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-brand/5 blur-[100px]" />
      </div>

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card/70 p-8 shadow-[var(--shadow-elegant)] backdrop-blur-xl"
      >
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight font-display">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue your learning journey.</p>
        </div>

        {verifiedBanner && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Email verified! You can now sign in.
          </div>
        )}

        {/* Fields */}
        <div className="space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm transition-all placeholder:text-muted-foreground/50 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</span>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm transition-all placeholder:text-muted-foreground/50 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
            />
          </label>
        </div>

        {error && (
          <p id="login-error" role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
            {error}
          </p>
        )}

        <button
          id="login-submit"
          type="submit"
          disabled={busy}
          className="group relative h-11 w-full overflow-hidden rounded-lg bg-[image:var(--gradient-brand)] text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-all hover:opacity-90 hover:shadow-[0_0_30px_-5px_var(--brand)] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card/70 px-2 text-muted-foreground backdrop-blur-xl">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={busy}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background/50 text-sm font-medium transition-colors hover:bg-muted focus:outline-none disabled:opacity-60"
        >
          <FcGoogle className="h-5 w-5" />
          Google
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}
