import { create } from "zustand";
import { useEffect } from "react";
import { authClient } from "../lib/auth";


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

type SessionData = Record<string, string>;

interface SessionState {
  session: SessionData | null;
  setSession: (newSession: SessionData) => void;
  closeSession: () => void;
}

const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  setSession: (newSession: SessionData) => {
    set(() => ({session: newSession}))
  },
  isAuthenticated: () => {
    const session = get().session;
    if(!session) {
      return false;
    };
    return true;
  },
  closeSession: () => {
    set(() => ({session: null}))
  }
}))

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  fetchSession: async () => {
    try {
      const response = await authClient.getSession();
      console.log("Session response:", response.data);

      
      if(!response.data || response.error) throw new Error();
      const {user, session} = response.data;
      const formatted = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        session: {
          token: session.token,
          activeOrganizationId: session.activeOrganizationId ?? ""
        }
      }

      set({session: formatted, isLoading: false})

    } catch (error) {
      console.error("Session fetch error:", error);
      set({ session: null, isLoading: false });
    }
  }
  
  
  
  /*async () => {
    try {
      const response = await apiClient.get("/auth/get-session");
      console.log("Session response:", response.data);
      set({ session: response.data, isLoading: false });
    } catch (error) {
      console.error("Session fetch error:", error);
      set({ session: null, isLoading: false });
    }
  }*/,
  logout: async () => {
    try {
      await authClient.signOut()
      set({session: null});
    } catch(error) {
      console.error("Logout failed", error);
    }
    
    /*try {
      await apiClient.post("/auth/sign-out");
      set({ session: null });
    } catch (error) {
      console.error("Logout failed", error);
    }*/
  },
}));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchSession = useAuthStore((state) => state.fetchSession);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return <>{children}</>;
}
