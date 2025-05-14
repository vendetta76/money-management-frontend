export const ROLES = [Regular, Premium, Admin, Staff, Tester] as const;
export type Role = typeof ROLES[number];