// hooks/useIsBypassed.ts
import { usePageLockStatus } from "./usePageLockStatus";
import { useAuth } from "../context/AuthContext";

const DEFAULT_BYPASS = ["Admin", "Staff", "Tester"];

export const useIsBypassed = (
  pageKey: string,
  bypassFor: string[] = DEFAULT_BYPASS
) => {
  const { locked, message } = usePageLockStatus(pageKey);
  const { user, userMeta } = useAuth();

  const normalizedBypass = bypassFor.map((b) => b.toLowerCase());
  const email = user?.email?.toLowerCase() || "";
  const role = userMeta?.role?.toLowerCase() || "";

  const isBypassed = normalizedBypass.includes(email) || normalizedBypass.includes(role);

  return {
    locked,
    message,
    isBypassed,
    user,
    userMeta,
  };
};
