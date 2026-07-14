import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";

const SAFE_TAGS = new Set(["DIV", "BUTTON", "SPAN", "INPUT", "SVG", "PATH", "RECT"]);
const KNOWN_DATA_ATTRS = [
  "data-context-type",
  "data-magic-bento",
  "data-radix-popper-content-wrapper",
];
const EXTENSION_PATTERNS = [
  /idm/i,
  /download/i,
  /helper/i,
  /injected/i,
  /overlay/i,
  /video.*grab/i,
  /catch.*tube/i,
  /flashgot/i,
  /yt.*dl/i,
];

function isInjectedNode(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const el = node as Element;
  if (SAFE_TAGS.has(el.tagName)) return false;
  if (el.tagName === "IFRAME") {
    const src = (el as HTMLIFrameElement).src || "";
    return !src.includes("youtube.com") && !src.includes("youtu.be") && src !== "";
  }
  if (!KNOWN_DATA_ATTRS.some((attr) => el.hasAttribute(attr))) {
    const idOrClass = `${el.id} ${el.className}`;
    if (EXTENSION_PATTERNS.some((rx) => rx.test(idOrClass))) return true;
    if (el.tagName.includes("-") || el.shadowRoot) return true;
  }
  return false;
}

export function useExtensionGuard(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [isExtensionDetected, setIsExtensionDetected] = useState(false);

  const reset = useCallback(() => setIsExtensionDetected(false), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (isInjectedNode(node)) {
            console.warn("[Security] External node injection detected:", node);
            try {
              (node as Element).remove();
            } catch (_) {
              /* ignore */
            }
            setIsExtensionDetected(true);
            toast.error("Security Alert: External extension detected in the video player.", {
              duration: 6000,
            });
            return;
          }
        }
      }
    });

    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [containerRef]);

  return { isExtensionDetected, reset };
}
