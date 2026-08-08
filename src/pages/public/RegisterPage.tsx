
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
        toast.success("Login successful! Welcome to Kodeversity.");

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
    <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]"
      >
        <div>
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join Kodeversity and start learning.</p>
        </div>

        <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted/50 p-1">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${role === "student" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Student
          </button>
          <button
            type="button"
            
            onClick={() => setRole("instructor")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${role === "instructor" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Instructor
          </button>
        </div>

        <label className="block text-sm">
          <span className="text-muted-foreground">Email</span>
          <input
            id="register-email"
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
            id="register-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        <label className="block text-sm">
          <span className="text-muted-foreground">Confirm password</span>
          <input
            id="register-confirm-password"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        {error && (
          <p id="register-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          id="register-submit"
          type="submit"
          disabled={busy}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleGoogleSignup()}
          disabled={busy}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-muted focus:outline-none disabled:opacity-60"
        >
          <FcGoogle className="h-5 w-5" />
          Google
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>

      <OtpModal email={email} open={otpOpen} onSuccess={() => setOtpOpen(false)} />
    </main>
  );
}
