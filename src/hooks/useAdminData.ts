import { useEffect, useState } from "react";

export function useAdminData() {
  const [summary, setSummary] = useState({ totalUsers: 0, totalBalance: 0, totalTransactions: 0 });
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/admin/summary")
      .then(res => res.json())
      .then(data => setSummary(data));

    fetch("/api/admin/transactions")
      .then(res => res.json())
      .then(data => setTransactions(data));

    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return { summary, transactions, users };
}