import { useEffect, useState } from "react";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

const BASE_URL = "https://money-management-backend-f6dg.onrender.com";

export function useAdminData() {
  const [summary, setSummary] = useState({ totalUsers: 0, totalBalance: 0, totalTransactions: 0 });
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("✅ onAuthStateChanged fired. User:", user);
      if (!user) return;

      try {
        const token = await getIdToken(user);
        console.log("🔑 Firebase token:", token);

        const headers = { Authorization: `Bearer ${token}` };

        const [summaryRes, txRes, usersRes] = await Promise.all([
          fetch(`${BASE_URL}/api/admin/summary`, { headers }),
          fetch(`${BASE_URL}/api/admin/transactions`, { headers }),
          fetch(`${BASE_URL}/api/admin/users`, { headers }),
        ]);

        console.log("📦 Response status:", {
          summary: summaryRes.status,
          transactions: txRes.status,
          users: usersRes.status,
        });

        const summaryData = await summaryRes.json();
        const txData = await txRes.json();
        const usersData = await usersRes.json();

        console.log("📊 Summary Data:", summaryData);
        console.log("📄 Transactions:", txData);
        console.log("👥 Users:", usersData);

        setSummary(summaryData);
        setTransactions(txData);
        setUsers(usersData);
      } catch (err) {
        console.error("❌ Error fetching admin data:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  return { summary, transactions, users };
}