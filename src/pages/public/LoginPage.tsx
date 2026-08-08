
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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={busy}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-muted focus:outline-none disabled:opacity-60"
        >
          <FcGoogle className="h-5 w-5" />
          Google
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}
