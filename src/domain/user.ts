export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "instructor" | "admin";
  avatarUrl?: string;
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
