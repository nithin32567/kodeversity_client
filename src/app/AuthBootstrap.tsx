import { useEffect, type ReactNode } from "react";
import { useAppDispatch } from "@/app/hooks";
import { bootstrapAuth, registerUnauthorizedHandler } from "@/features/auth/authSlice";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    registerUnauthorizedHandler(dispatch);
    void dispatch(bootstrapAuth());
  }, [dispatch]);

  return <>{children}</>;
}
