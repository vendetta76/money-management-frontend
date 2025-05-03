import { useState } from "react"

interface IncomeEntry {
  description: string
  amount: number
  category: string
}

const IncomePage = () => {
  const [incomes, setIncomes] = useState<IncomeEntry[]>([])
  const [form, setForm] = useState({ description: "", amount: "", category: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newIncome = {
      description: form.description,
      amount: parseInt(form.amount),
      category: form.category,
    }
    setIncomes([...incomes, newIncome])
    setForm({ description: "", amount: "", category: "" })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-300">📥 Pemasukan</h1>

      {/* Form Tambah Pemasukan */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Deskripsi"
          required
          className="border px-3 py-2 rounded dark:bg-gray-900 dark:text-white"
        />
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Jumlah"
          required
          className="border px-3 py-2 rounded dark:bg-gray-900 dark:text-white"
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded dark:bg-gray-900 dark:text-white"
        >
          <option value="">Pilih Kategori</option>
          <option value="Gaji">Gaji</option>
          <option value="Bonus">Bonus</option>
          <option value="Freelance">Freelance</option>
          <option value="Lainnya">Lainnya</option>
        </select>
        <button
          type="submit"
          className="col-span-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
        >
          Tambah
        </button>
      </form>

      {/* Daftar Pemasukan */}
      {incomes.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-white">Daftar Pemasukan</h2>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300">
              <tr>
                <th className="text-left py-2">Deskripsi</th>
                <th className="text-left py-2">Jumlah</th>
                <th className="text-left py-2">Kategori</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-200">
              {incomes.map((inc, i) => (
                <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="py-2">{inc.description}</td>
                  <td className="py-2">Rp {inc.amount.toLocaleString("id-ID")}</td>
                  <td className="py-2">{inc.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default IncomePage
