import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function MoneySplitSimulator() {
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState([
    { name: "Tabungan", percent: 30 },
    { name: "Investasi", percent: 25 },
    { name: "Kebutuhan", percent: 35 },
    { name: "Hiburan", percent: 5 },
    { name: "Lainnya", percent: 5 }
  ])
  const [error, setError] = useState("")
  const [result, setResult] = useState([])

  const totalPercent = categories.reduce((sum, item) => sum + item.percent, 0)

  const handleChange = (i: number, field: string, value: string) => {
    const newCategories = [...categories]
    newCategories[i][field] = field === "percent" ? Number(value) : value
    setCategories(newCategories)
  }

  const handleCalculate = () => {
    if (totalPercent !== 100) {
      setError(`Total persen harus 100% (saat ini ${totalPercent}%)`)
      return
    }
    setError("")
    setResult(
      categories.map((item) => ({
        ...item,
        value: (item.percent / 100) * total
      }))
    )
  }

  return (
    <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6 mt-10">
      <h2 className="text-xl font-bold mb-4">Money Split Simulator</h2>

      <Input
        type="number"
        placeholder="Total uang (contoh: 10000000)"
        value={total}
        onChange={(e) => setTotal(Number(e.target.value))}
        className="mb-4"
      />

      {categories.map((cat, idx) => (
        <div className="flex gap-2 mb-2" key={idx}>
          <Input
            value={cat.name}
            onChange={(e) => handleChange(idx, "name", e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            value={cat.percent}
            onChange={(e) => handleChange(idx, "percent", e.target.value)}
            className="w-24"
          />
          <span className="self-center text-sm text-gray-500">%</span>
        </div>
      ))}

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <Button onClick={handleCalculate} className="mb-4">
        Hitung
      </Button>

      {result.length > 0 && (
        <div className="space-y-2">
          {result.map((r, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{r.name} ({r.percent}%)</span>
              <span>Rp {r.value.toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
