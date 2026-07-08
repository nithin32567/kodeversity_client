/**
 * RegisterPage
 * Migrated from: src/routes/register.tsx
 *
 * Changes from TanStack version:
 *   - Removed: createFileRoute, Route.useSearch(), useNavigate from @tanstack
 *   - Added: useNavigate, useSearchParams, Link from react-router-dom
 *   - Auth: useRegisterMutation, useSendOtpMutation, useVerifyOtpMutation from authApi
 *     instead of useAuth() Context methods
 */
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getAuthErrorMessage } from "@/domain/auth";
import {
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "@/features/auth/authApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/presentation/core-ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/presentation/core-ui/input-otp";

const OTP_RESEND_SECONDS = 30;

interface OtpModalProps {
  email: string;
  open: boolean;
  onSuccess: () => void;
}

function OtpModal({ email, open, onSuccess }: OtpModalProps) {
  const [verifyOtp] = useVerifyOtpMutation();
  const [sendOtp] = useSendOtpMutation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) return;
    setCountdown(OTP_RESEND_SECONDS);
    setOtp("");
    setError(null);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open]);

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await sendOtp({ email }).unwrap();
      setCountdown(OTP_RESEND_SECONDS);
      setOtp("");
      timerRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setError(getAuthErrorMessage((err as Error).message));
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      await verifyOtp({ email, otp }).unwrap();
      onSuccess();
    } catch (err) {
      setError(getAuthErrorMessage((err as Error).message));
      setOtp("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Verify your email</DialogTitle>
          <DialogDescription>
            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
            Enter it below to activate your account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          <InputOTP id="otp-input" maxLength={6} value={otp} onChange={setOtp} disabled={busy}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <p id="otp-error" role="alert" className="text-center text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            id="otp-verify-btn"
            type="button"
            disabled={otp.length !== 6 || busy}
            onClick={handleVerify}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Verify email"}
          </button>

          <div className="text-center text-xs text-muted-foreground">
            {countdown > 0 ? (
              <span>
                Resend code in{" "}
                <span className="font-medium tabular-nums text-foreground">{countdown}s</span>
              </span>
            ) : (
              <button
                id="otp-resend-btn"
                type="button"
                disabled={resending}
                onClick={handleResend}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {resending ? "Sending…" : "Resend code"}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
      await registerMutation({ email, password }).unwrap();
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
