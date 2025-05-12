import { useEffect, useState } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export function useAdminData() {
  const [summary, setSummary] = useState({ totalUsers: 0, totalBalance: 0, totalTransactions: 0 });
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await getIdToken(user);
        const headers = { Authorization: `Bearer ${token}` };

        const summaryRes = await fetch("/api/admin/summary", { headers });
        const summaryData = await summaryRes.json();
        setSummary(summaryData);

        const txRes = await fetch("/api/admin/transactions", { headers });
        const txData = await txRes.json();
        setTransactions(txData);

        const usersRes = await fetch("https://money-management-backend-f6dg.onrender.com/api/admin/users", { headers });
        const usersData = await usersRes.json();
        setUsers(usersData);
      } catch (err) {
        console.error("❌ Error fetching admin data:", err);
      }
    };

    fetchData();
  }, []);

  return { summary, transactions, users };
}
