import { Award, Lock, ShieldCheck } from "lucide-react";
import signInIllustration from "@/assets/auth-graduation.png";
import signUpIllustration from "@/assets/auth-book.png";
import { BrandMark } from "./BrandMark";

interface AuthPromoPanelProps {
  mode?: "sign-in" | "sign-up";
}

const CONTENT = {
  "sign-in": {
    greeting: "Hello",
    headline: "Welcome Back!",
    emoji: "👋",
    description:
      "Continue your learning journey and unlock new skills and opportunities",
    illustration: signInIllustration,
    illustrationAlt: "Illustration of a graduation cap orbiting rings",
  },
  "sign-up": {
    greeting: "Create your",
    headline: "Kodeversity account",
    emoji: "",
    description:
      "Join thousands of learners and start your journey towards mastering new skills.",
    illustration: signUpIllustration,
    illustrationAlt: "Illustration of a glowing book and pen on a learning platform",
  },
};

export function AuthPromoPanel({ mode = "sign-in" }: AuthPromoPanelProps) {
  const content = CONTENT[mode];

  return (
    <section className="auth-panel relative flex flex-col justify-between overflow-hidden px-8 py-10 sm:px-12 sm:py-12">
      {/* Decorative rings — purely visual */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-24 size-[36rem] rounded-full border border-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-56 top-10 size-[40rem] rounded-full border border-white/[0.06]"
      />

      <BrandMark />

      {/* Headline block */}
      <div className="relative mt-12 max-w-md">
        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          <span className="block text-white">{content.greeting}</span>
          <span className="block brand-text-gradient">
            {content.headline}
            {content.emoji ? (
              <span className="align-middle text-white"> {content.emoji}</span>
            ) : null}
          </span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-white/65">
          {content.description}
        </p>
      </div>

      {/* Illustration */}
      <div className="relative mt-10 flex flex-1 items-center justify-center">
        <img
          src={content.illustration}
          alt={content.illustrationAlt}
          width={1024}
          height={896}
          loading="lazy"
          className="w-full max-w-sm select-none drop-shadow-2xl"
        />
      </div>

      {/* Bottom trust badges */}
      {mode === "sign-up" ? (
        <div className="relative mt-8 grid grid-cols-3 gap-4 text-sm text-white/55">
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>Trusted by 10,000+ learners worldwide</span>
          </p>
          <p className="flex items-start gap-2">
            <Award className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>High quality learning content</span>
          </p>
          <p className="flex items-start gap-2">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>Secure and privacy focused</span>
          </p>
        </div>
      ) : (
        <p className="relative mt-8 flex items-center gap-2 text-sm text-white/55">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          Trusted by 10,000+ learners worldwide
        </p>
      )}
    </section>
  );
}
