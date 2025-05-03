// src/components/ActivityLogPanel.tsx

import { useEffect, useState } from "react"
import { db } from "../../firebase"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { format } from "date-fns"

const ActivityLogPanel = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    setLoading(true)
    const q = query(collection(db, "logs"), orderBy("timestamp", "desc"))
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    setLogs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Log Aktivitas
      </h2>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Memuat log...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">Belum ada aktivitas.</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-700 dark:text-gray-300">
              <th className="py-2">Email</th>
              <th className="py-2">Aksi</th>
              <th className="py-2">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className="border-t border-gray-300 dark:border-gray-700"
              >
                <td className="py-2">{log.userEmail}</td>
                <td className="py-2 capitalize">{log.action}</td>
                <td className="py-2">
                  {format(new Date(log.timestamp), "dd MMM yyyy HH:mm")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ActivityLogPanel
