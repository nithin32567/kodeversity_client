/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/core-ui/dialog";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: "" });
  const [resolve, setResolve] = useState<(value: boolean) => void>();

  const confirm = useCallback((opts: ConfirmOptions | string) => {
    return new Promise<boolean>((res) => {
      setOptions(typeof opts === "string" ? { message: opts } : opts);
      setResolve(() => res);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    if (resolve) resolve(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolve) resolve(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{options.title || "Confirm"}</DialogTitle>
            <DialogDescription>{options.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {options.cancelText !== "" && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                {options.cancelText ?? "Cancel"}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-primary-foreground rounded-md transition-colors ${
                options.destructive
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {options.confirmText ?? "Confirm"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
