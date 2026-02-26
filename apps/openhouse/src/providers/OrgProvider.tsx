import { create } from "zustand";
import { useEffect } from "react";
import { useAuthStore } from "./AuthProvider";

interface OrgState {
  organizationId: string | null;
  setOrganizationId: (id: string) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  organizationId: null,
  setOrganizationId: (id) => set({ organizationId: id }),
}));

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const session = useAuthStore((state) => state.session);
  const setOrganizationId = useOrgStore((state) => state.setOrganizationId);

  useEffect(() => {
    if (session?.session?.activeOrganizationId) {
      setOrganizationId(session.session.activeOrganizationId);
    }
  }, [session, setOrganizationId]);

  return <>{children}</>;
}
