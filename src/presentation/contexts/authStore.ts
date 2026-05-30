import type { User } from "@/domain/user";

type Listener = (snapshot: AuthSnapshot) => void;

export interface AuthSnapshot {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

let snapshot: AuthSnapshot = { isAuthenticated: false, isLoading: true, user: null };
const listeners = new Set<Listener>();

export const authStore = {
  get: () => snapshot,
  set: (next: AuthSnapshot) => {
    snapshot = next;
    listeners.forEach((l) => l(snapshot));
  },
  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
