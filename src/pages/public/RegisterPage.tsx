
import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getAuthErrorMessage, UserRole } from "@/domain/auth";
import { useRegisterMutation } from "@/features/auth/authApi";
import { OtpModal } from "@/features/auth/components/OtpModal";
import { useAppDispatch } from "@/app/hooks";
import { googleLoginThunk } from "@/features/auth/authSlice";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

export function RegisterPage() {
  const [registerMutation] = useRegisterMutation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialEmail = searchParams.get("email") ?? "";
  const initialStep = searchParams.get("step");

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [otpOpen, setOtpOpen] = useState(initialStep === "otp" && !!initialEmail);
  const [role, setRole] = useState<"student" | "instructor">("student");

  const dispatch = useAppDispatch();

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setBusy(true);
      setError(null);
      try {
        const result = await dispatch(googleLoginThunk({ code: codeResponse.code, role }));
        if (!googleLoginThunk.fulfilled.match(result)) {
          const errMsg = (result.payload as Error | undefined)?.message ?? "SIGNUP_FAILED";
          setError(getAuthErrorMessage(errMsg));
          return;
        }

        const user = result.payload;
        console.log("Email sent response:", (result.payload as any)?.emailResponse || "No email sent");
        toast.success("Login successful! Welcome to Study Laah.");

        if (user.role === UserRole.INSTRUCTOR) {
          navigate("/instructor/dashboard");
        } else {
          navigate("/student/dashboard");
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
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      const res = await registerMutation({ email, password, role }).unwrap();
      console.log("Email sent response:", (res as any)?.emailResponse || "No email sent");
      toast.success("Account created successfully! Welcome email sent.");
      navigate(`/login?verified=${encodeURIComponent(email)}`);
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
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-brand/5 blur-[100px]" />
      </div>

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card/70 p-8 shadow-[var(--shadow-elegant)] backdrop-blur-xl"
      >
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight font-display">Create account</h1>
          <p className="text-sm text-muted-foreground">Join Study Laah and start learning today.</p>
        </div>

        {/* Role Toggle */}
        <div className="flex w-full items-center gap-1.5 rounded-lg border border-border bg-background/40 p-1">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
              role === "student"
                ? "bg-brand text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole("instructor")}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
              role === "instructor"
                ? "bg-brand text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Instructor
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
            <input
              id="register-email"
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
              id="register-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm transition-all placeholder:text-muted-foreground/50 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm password</span>
            <input
              id="register-confirm-password"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm transition-all placeholder:text-muted-foreground/50 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
            />
          </label>
        </div>

        {error && (
          <p id="register-error" role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
            {error}
          </p>
        )}

        <button
          id="register-submit"
          type="submit"
          disabled={busy}
          className="group relative h-11 w-full overflow-hidden rounded-lg bg-[image:var(--gradient-brand)] text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-all hover:opacity-90 hover:shadow-[0_0_30px_-5px_var(--brand)] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card/70 px-2 text-muted-foreground backdrop-blur-xl">Or sign up with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleGoogleSignup()}
          disabled={busy}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background/50 text-sm font-medium transition-colors hover:bg-muted focus:outline-none disabled:opacity-60"
        >
          <FcGoogle className="h-5 w-5" />
          Google
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </form>

      <OtpModal email={email} open={otpOpen} onSuccess={() => setOtpOpen(false)} />
    </main>
  );
}
