import { useState, useEffect, useCallback } from "react";

export type ContextType = "video" | "lesson-content" | "default";

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  contextType: ContextType;
  selectedText: string;
}

export function useContextMenu() {
  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    contextType: "default",
    selectedText: "",
  });

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();

    // Get selected text if any (for note taking / highlighting / Ask AI)
    const selection = window.getSelection()?.toString().trim() || "";

    // Determine the context by traversing up the DOM from the target element
    let target = e.target as HTMLElement | null;
    let contextType: ContextType = "default";

    while (target) {
      const contextAttr = target.getAttribute("data-context-menu");
      if (contextAttr) {
        contextType = contextAttr as ContextType;
        break;
      }
      target = target.parentElement;
    }

    setState({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      contextType,
      selectedText: selection,
    });
  }, []);

  const closeMenu = useCallback(() => {
    setState((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  }, []);

  useEffect(() => {
    // Intercept right-clicks globally
    window.addEventListener("contextmenu", handleContextMenu);
    // Click outside to close
    window.addEventListener("click", closeMenu);
    // Scroll to close
    window.addEventListener("scroll", closeMenu);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu);
    };
  }, [handleContextMenu, closeMenu]);

  useEffect(() => {
    // Escape key to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu]);

  return {
    ...state,
    closeMenu,
  };
}
