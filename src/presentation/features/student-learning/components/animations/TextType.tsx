import { useEffect, useRef, useState, type ElementType } from "react";

type Props = {
  text: string | string[];
  as?: ElementType;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  initialDelay?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorCharacter?: string;
  cursorClassName?: string;
  className?: string;
  textColors?: string[];
  startOnVisible?: boolean;
};

export function TextType({
  text,
  as: Tag = "span",
  typingSpeed = 60,
  deletingSpeed = 35,
  pauseDuration = 1800,
  initialDelay = 0,
  loop = true,
  showCursor = true,
  cursorCharacter = "|",
  cursorClassName = "",
  className = "",
  textColors,
  startOnVisible = false,
}: Props) {
  const sentencesRef = useRef<string[]>(Array.isArray(text) ? text : [text as string]);
  // keep ref in sync if prop changes
  sentencesRef.current = Array.isArray(text) ? text : [text as string];

  const [display, setDisplay] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(!startOnVisible);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  useEffect(() => {
    if (!startOnVisible || !rootRef.current) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setStarted(true), {
      threshold: 0.1,
    });
    obs.observe(rootRef.current);
    return () => obs.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!started) return;
    if (reducedMotion) {
      setDisplay(sentencesRef.current[0] ?? "");
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let index = 0;
    let current = "";
    let deleting = false;

    const schedule = (ms: number, fn: () => void) => {
      timer = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const step = () => {
      const sentence = sentencesRef.current[index % sentencesRef.current.length] ?? "";

      if (!deleting && current === sentence) {
        if (sentencesRef.current.length === 1 && !loop) return;
        schedule(pauseDuration, () => {
          deleting = true;
          step();
        });
        return;
      }

      if (deleting && current === "") {
        deleting = false;
        index = (index + 1) % sentencesRef.current.length;
        setColorIndex(index);
        step();
        return;
      }

      current = deleting
        ? sentence.slice(0, current.length - 1)
        : sentence.slice(0, current.length + 1);
      setDisplay(current);

      const delay = deleting
        ? deletingSpeed
        : current.length === 1
          ? initialDelay || typingSpeed
          : typingSpeed;
      schedule(delay, step);
    };

    step();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [started, reducedMotion, typingSpeed, deletingSpeed, pauseDuration, initialDelay, loop]);

  const color = textColors?.[colorIndex % (textColors?.length || 1)];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TagComp = Tag as any;
  return (
    <TagComp ref={rootRef} className={className} style={color ? { color } : undefined}>
      {display}
      {showCursor && (
        <span className={`inline-block animate-pulse ${cursorClassName}`}>{cursorCharacter}</span>
      )}
    </TagComp>
  );
}

export default TextType;
