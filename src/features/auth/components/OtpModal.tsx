import { useState, useEffect, useRef } from "react";
import { getAuthErrorMessage } from "@/domain/auth";
import {
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

export interface OtpModalProps {
  email: string;
  open: boolean;
  onSuccess: () => void;
}

export function OtpModal({ email, open, onSuccess }: OtpModalProps) {
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
