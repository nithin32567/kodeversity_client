import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { useAppDispatch } from "@/app/hooks";
import { loginThunk, googleLoginThunk } from "@/features/auth/authSlice";
import { getAuthErrorMessage, UserRole } from "@/domain/auth";
import { useGoogleLogin } from "@react-oauth/google";
import { Mail as MailIcon } from "lucide-react";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { AuthPromoPanel } from "@/components/auth/AuthPromoPanel";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get("redirect") ?? "/student/dashboard";
  const verifiedEmail = searchParams.get("verified") ?? "";

  const [email, setEmail] = useState(verifiedEmail);
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setSubmitting(true);
      setFormError(null);
      try {
        const result = await dispatch(googleLoginThunk({ code: codeResponse.code }));
        if (!googleLoginThunk.fulfilled.match(result)) {
          const errMsg = (result.payload as Error | undefined)?.message ?? "LOGIN_FAILED";
          setFormError(getAuthErrorMessage(errMsg));
          return;
        }
        const user = result.payload;
        if (user.role === UserRole.ADMIN) {
          setFormError("Admins must use the secure admin portal to log in.");
          return;
        }
        navigate(user.role === UserRole.INSTRUCTOR ? "/instructor/dashboard" : redirectTo);
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
    setSubmitting(true);
    setFormError(null);
    setNotice(null);
    try {
      const result = await dispatch(loginThunk({ email, password }));
      if (!loginThunk.fulfilled.match(result)) {
        const errMsg = (result.payload as Error | undefined)?.message ?? "LOGIN_FAILED";
        if (errMsg === "EMAIL_NOT_VERIFIED") {
          navigate(`/register?email=${encodeURIComponent(email)}&step=otp`);
          return;
        }
        setFormError(getAuthErrorMessage(errMsg));
        return;
      }
      const user = result.payload;
      if (user.role === UserRole.ADMIN) {
        setFormError("Admins must use the secure admin portal to log in.");
        return;
      }
      navigate(user.role === UserRole.INSTRUCTOR ? "/instructor/dashboard" : redirectTo);
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
        <AuthPromoPanel mode="sign-in" />

        {/* ── Right: Sign-in form ── */}
        <div className="border-t border-border bg-background lg:border-l lg:border-t-0">
          <section className="flex h-full flex-col justify-center px-6 py-6 sm:px-12">
            <div className="mx-auto w-full max-w-md">

              {/* Verified-email banner */}
              {verifiedEmail && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-600 dark:text-green-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                  Email verified! You can now sign in.
                </div>
              )}

              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Sign in to your account
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Create a new account
                </Link>
              </p>

              <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
                <AuthField
                  id="login-email"
                  label="Email address"
                  icon={<Mail />}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div className="space-y-2">
                  <AuthField
                    id="login-password"
                    label="Password"
                    icon={<Lock />}
                    revealable
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {formError ? (
                  <p role="alert" className="text-sm text-destructive">
                    {formError}
                  </p>
                ) : null}
                {notice ? (
                  <p role="status" className="text-sm text-success">
                    {notice}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  variant="brand"
                  size="xl"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>

              {/* ── OR divider ── */}
              <div className="my-4 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground">or continue with</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {/* ── Social buttons 2×2 grid ── */}
              <SocialAuthButtons
                disabled={submitting}
                onSelect={(provider) => {
                  if (provider === "google") handleGoogleLogin();
                }}
              />

              {/* ── Magic Link ── */}
              <div className="mt-4 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                  or continue with
                  <button
                    type="button"
                    onClick={() => setNotice("Magic link sent! Check your inbox.")}
                    className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    <MailIcon className="size-4" aria-hidden />
                    Magic Link
                  </button>
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                By signing in, you agree to our{" "}
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
    </main>
  );
}
