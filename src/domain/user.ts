import { UserRole } from "./auth";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  status?: "ACTIVE" | "SUSPENDED"| "DELETED";
}

export interface UserProfile extends User {
  bio?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface Session {
  user: User;
  tokens: AuthTokens;
}
