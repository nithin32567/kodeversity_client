import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/domain/user";
import { UserRole } from "@/domain/auth";
import { authService } from "@/infrastructure/auth/authService";
import { tokenStore, setUnauthorizedHandler } from "@/infrastructure/http/apiClient";
import type { AppDispatch } from "@/app/store";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function normalizeRole(role: string): UserRole {
  const r = role.toUpperCase();
  if (r === "ADMIN") return UserRole.ADMIN;
  if (r === "INSTRUCTOR") return UserRole.INSTRUCTOR;
  return UserRole.STUDENT;
}

export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async (_, { rejectWithValue }) => {
  try {
    const { accessToken } = await authService.refresh();
    tokenStore.set(accessToken);

    const { user } = await authService.verifyToken();
    const normalized: User = {
      id: user.id,
      email: "",
      name: "",
      role: normalizeRole(user.role),
    };
    return normalized;
  } catch (err: any) {
    tokenStore.set(null);
    return rejectWithValue({
      status: err?.status ?? "FETCH_ERROR",
      message: err?.message ?? "Failed to bootstrap auth",
      code: err?.code ?? "UNKNOWN",
    });
  }
});

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { accessToken, user } = await authService.login(payload);
      tokenStore.set(accessToken);
      const normalized: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: normalizeRole(user.role as string),
        avatarUrl: user.avatarUrl,
      };
      return normalized;
    } catch (err: any) {
      return rejectWithValue({
        status: err?.status ?? "FETCH_ERROR",
        message: err?.message ?? "Login failed",
        code: err?.code ?? "UNKNOWN",
      });
    }
  },
);
export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
  } finally {
    tokenStore.set(null);
  }
});

export const registerUnauthorizedHandler = (dispatch: AppDispatch) => {
  setUnauthorizedHandler(() => {
    dispatch(authSlice.actions.clearUser());
  });
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },

    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });

    builder
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });

    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
  },
});
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role ?? null;
