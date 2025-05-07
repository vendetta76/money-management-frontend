export function maxWalletPerRole(role: string | undefined): number {
    switch (role) {
      case "premium":
        return 10;
      case "admin":
        return 99; // opsional, biar admin unlimited
      default:
        return 5;
    }
  }
  