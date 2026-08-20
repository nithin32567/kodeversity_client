import { useState, type FormEvent, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Lock, Mail } from "lucide-react";
import { useAppDispatch } from "@/app/hooks";
import { googleLoginThunk } from "@/features/auth/authSlice";
import { getAuthErrorMessage, UserRole } from "@/domain/auth";
import { useRegisterMutation } from "@/features/auth/authApi";
import { OtpModal } from "@/features/auth/components/OtpModal";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { AuthPromoPanel } from "@/components/auth/AuthPromoPanel";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/button";

// ─── Password strength check item ────────────────────────────────────────────

function CheckItem({ satisfied, label }: { satisfied: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <CheckCircle2
        className={satisfied ? "size-4 shrink-0 text-success" : "size-4 shrink-0 text-muted-foreground/40"}
        aria-hidden
      />
      <span className={satisfied ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────

export function RegisterPage() {
  const [registerMutation] = useRegisterMutation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const initialEmail = searchParams.get("email") ?? "";
  const initialStep = searchParams.get("step");

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpOpen, setOtpOpen] = useState(initialStep === "otp" && !!initialEmail);
  const [role, setRole] = useState<"student" | "instructor">("student");

  // Password strength checks
  const checks = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    }),
    [password],
  );

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setSubmitting(true);
      setFormError(null);
      try {
        const result = await dispatch(googleLoginThunk({ code: codeResponse.code, role }));
        if (!googleLoginThunk.fulfilled.match(result)) {
          const errMsg = (result.payload as Error | undefined)?.message ?? "SIGNUP_FAILED";
          setFormError(getAuthErrorMessage(errMsg));
          return;
        }
        const user = result.payload;
        toast.success("Login successful! Welcome to Kodeversity.");
        navigate(user.role === UserRole.INSTRUCTOR ? "/instructor/dashboard" : "/student/dashboard");
      } catch (err) {
        setFormError(getAuthErrorMessage((err as Error).message));
      } finally {
        setSubmitting(false);
      }
    },
    flow: "auth-code",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await registerMutation({ email, password, role }).unwrap();
      console.log("Email sent response:", (res as any)?.emailResponse || "No email sent");
      toast.success("Account created successfully! Welcome email sent.");
      navigate(`/login?verified=${encodeURIComponent(email)}`);
    } catch (err) {
      setFormError(getAuthErrorMessage((err as Error).message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
        {/* ── Left: Promo panel ── */}
        <AuthPromoPanel mode="sign-up" />

        {/* ── Right: Register form ── */}
        <div className="border-t border-border bg-background lg:border-l lg:border-t-0">
          <section className="flex h-full flex-col justify-center overflow-y-auto px-6 py-6 sm:px-12">
            <div className="mx-auto w-full max-w-md">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Create your account
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>

              {/* ── Role toggle ── */}
              <div className="mt-5 flex w-full items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={[
                    "flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all",
                    role === "student"
                      ? "brand-gradient text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("instructor")}
                  className={[
                    "flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all",
                    role === "instructor"
                      ? "brand-gradient text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  Instructor
                </button>
              </div>

              <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
                <AuthField
                  id="register-email"
                  label="Email address"
                  icon={<Mail />}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <AuthField
                  id="register-password"
                  label="Password"
                  icon={<Lock />}
                  revealable
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <AuthField
                  id="register-confirm-password"
                  label="Confirm password"
                  icon={<Lock />}
                  revealable
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                {/* Password strength checklist */}
                <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
                  <CheckItem satisfied={checks.length} label="At least 8 characters" />
                  <CheckItem satisfied={checks.uppercase} label="One uppercase letter" />
                  <CheckItem satisfied={checks.number} label="One number" />
                </ul>

                {formError ? (
                  <p role="alert" className="text-sm text-destructive">
                    {formError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  variant="brand"
                  size="xl"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Creating account…" : "Create Account"}
                </Button>
              </form>

              {/* ── OR divider ── */}
              <div className="my-4 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground">or sign up with</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {/* ── Social buttons ── */}
              <button
                type="button"
                onClick={() => handleGoogleSignup()}
                disabled={submitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none disabled:opacity-60"
              >
                <FcGoogle className="size-5" />
                Google
              </button>

              <p className="mt-5 text-center text-xs text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Link to="/legal/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/legal/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </div>

      <OtpModal email={email} open={otpOpen} onSuccess={() => setOtpOpen(false)} />
    </main>
  );
}
