import { useState, useEffect, useCallback } from "react";

export type ContextType = "video" | "text" | "default";

export function useContextMenu() {
  const [state, setState] = useState({
    x: 0,
    y: 0,
    isToggled: false,
    contextType: "default" as ContextType,
  });

  const closeMenu = useCallback(() => {
    setState((prev) => ({ ...prev, isToggled: false }));
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      let contextType: ContextType = "default";
      const target = e.target as HTMLElement;

      // Determine context based on data attributes
      if (target.closest('[data-context-type="video"]')) {
        contextType = "video";
      } else if (target.closest('[data-context-type="text"]')) {
        contextType = "text";
      }

      // Calculate position to prevent overflowing off-screen
      const menuWidth = 250;
      const menuHeight = 300;
      let x = e.clientX;
      let y = e.clientY;

      if (x + menuWidth > window.innerWidth) {
        x = window.innerWidth - menuWidth;
      }
      if (y + menuHeight > window.innerHeight) {
        y = window.innerHeight - menuHeight;
      }

      setState({
        x,
        y,
        isToggled: true,
        contextType,
      });
    };

    const handleClick = () => {
      setState((prev) => {
        if (prev.isToggled) return { ...prev, isToggled: false };
        return prev;
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setState((prev) => {
          if (prev.isToggled) return { ...prev, isToggled: false };
          return prev;
        });
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return { ...state, closeMenu };
}
