/**
 * usePageProtection — Frontend Security Hook
 *
 * Attaches global listeners to:
 *  • Suppress the native context-menu (right-click) on the entire page.
 *  • Block common DevTools / View-Source keyboard shortcuts on Windows,
 *    Linux and macOS.
 *
 * NOTE: This is a client-side deterrent layer, NOT a server-side guarantee.
 * Always pair this with proper backend authorization and a strict CSP header.
 *
 * Cleans up every listener automatically when the consuming component unmounts.
 */

import { useEffect } from "react";

export function usePageProtection(): void {
  useEffect(() => {
    // ── 1. Block native right-click context menu ──────────────────────────────
    const handleContextMenu = (e: MouseEvent): void => {
      e.preventDefault();
      e.stopPropagation();
    };

    // ── 2. Block DevTools / View-Source keyboard shortcuts ────────────────────
    const handleKeyDown = (e: KeyboardEvent): void => {
      const ctrl = e.ctrlKey || e.metaKey; // Ctrl on Win/Linux; Cmd on Mac
      const shift = e.shiftKey;
      const alt = e.altKey; // Option on Mac
      const key = e.key;

      // F12 — Open DevTools (Chrome, Edge, Firefox)
      if (key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Ctrl+Shift+I  /  Cmd+Option+I — Inspect / DevTools
      if (ctrl && (shift || alt) && (key === "I" || key === "i")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Ctrl+Shift+J  /  Cmd+Option+J — Console / DevTools
      if (ctrl && (shift || alt) && (key === "J" || key === "j")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Ctrl+U  /  Cmd+Option+U — View Page Source
      if (ctrl && (key === "U" || key === "u")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Ctrl+Shift+C  /  Cmd+Option+C — Inspect Element (Chrome/Edge)
      if (ctrl && (shift || alt) && (key === "C" || key === "c")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Ctrl+Shift+K — Console (Firefox)
      if (ctrl && shift && (key === "K" || key === "k")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    // Attach — capture phase so listeners fire before React's synthetic events
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("keydown", handleKeyDown, true);

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []); // Runs once on mount, cleans up on unmount
}
