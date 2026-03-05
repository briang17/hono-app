import { create } from "zustand";
import { useEffect } from "react";
import { authClient } from "../lib/auth";


interface OrgState {
  organizationId: string | null;
  setOrganizationId: (id: string) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  organizationId: null,
  setOrganizationId: (id) => set({ organizationId: id }),
}));

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession();
  const setOrganizationId = useOrgStore((state) => state.setOrganizationId);

  useEffect(() => {
    if (session.data?.session.activeOrganizationId) {
      setOrganizationId(session.data?.session.activeOrganizationId);
    }
  }, [session, setOrganizationId]);

  return <>{children}</>;
}
