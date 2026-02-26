import { create } from "zustand";
import { useEffect } from "react";
import apiClient from "../lib/axios";

interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
  session: {
    token: string;
    activeOrganizationId: string;
  };
}

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  fetchSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  fetchSession: async () => {
    try {
      const response = await apiClient.get("/auth/get-session");
      console.log("Session response:", response.data);
      set({ session: response.data, isLoading: false });
    } catch (error) {
      console.error("Session fetch error:", error);
      set({ session: null, isLoading: false });
    }
  },
  logout: async () => {
    try {
      await apiClient.post("/auth/sign-out");
      set({ session: null });
    } catch (error) {
      console.error("Logout failed", error);
    }
  },
}));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchSession = useAuthStore((state) => state.fetchSession);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return <>{children}</>;
}
