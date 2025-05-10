// ✅ Versi lengkap Money Split Simulator dengan drag, undo, reset, add/remove, validasi total 100%
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function SortableItem({ id, item, index, onChange, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex gap-2 items-center mb-2">
      <Input
        value={item.name}
        onChange={(e) => onChange(index, 'name', e.target.value)}
        className="flex-1"
      />
      <Input
        type="number"
        value={item.percent}
        onChange={(e) => onChange(index, 'percent', e.target.value)}
        className="w-20"
      />
      <span>%</span>
      <Button variant="ghost" onClick={() => onRemove(index)} size="icon">❌</Button>
    </div>
  )
}

export default function MoneySplitAdvanced() {
  const [totalByCurrency, setTotalByCurrency] = useState({ IDR: 10000000, USD: 250, THB: 9000 })
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("moneySplitCategories")
    return saved ? JSON.parse(saved) : [
      { id: '1', name: "Tabungan", percent: 30 },
      { id: '2', name: "Investasi", percent: 25 },
      { id: '3', name: "Kebutuhan", percent: 35 },
      { id: '4', name: "Hiburan", percent: 5 },
      { id: '5', name: "Lainnya", percent: 5 },
    ]
  })
  const [prevCategories, setPrevCategories] = useState(null)

  const totalPercent = categories.reduce((sum, item) => sum + item.percent, 0)

  useEffect(() => {
    localStorage.setItem("moneySplitCategories", JSON.stringify(categories))
  }, [categories])

  const handleChange = (i, field, value) => {
    const updated = [...categories]
    updated[i][field] = field === 'percent' ? Number(value) : value
    setPrevCategories(categories)
    setCategories(updated)
  }

  const handleAdd = () => {
    setPrevCategories(categories)
    setCategories([...categories, { id: Date.now().toString(), name: "Baru", percent: 0 }])
  }

  const handleRemove = (i) => {
    setPrevCategories(categories)
    setCategories(categories.filter((_, idx) => idx !== i))
  }

  const handleReset = () => {
    setPrevCategories(categories)
    setCategories([])
  }

  const handleUndo = () => {
    if (prevCategories) {
      setCategories(prevCategories)
      setPrevCategories(null)
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex(c => c.id === active.id)
      const newIndex = categories.findIndex(c => c.id === over.id)
      setPrevCategories(categories)
      setCategories(arrayMove(categories, oldIndex, newIndex))
    }
  }

  const result = categories.map((cat) => {
    const valuePerCurrency = {}
    Object.entries(totalByCurrency).forEach(([currency, amount]) => {
      valuePerCurrency[currency] = (amount * cat.percent) / 100
    })
    return { ...cat, values: valuePerCurrency }
  })

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Money Split Simulator</h2>

      <h4 className="font-semibold text-sm mb-2">Total Uang</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Object.entries(totalByCurrency).map(([currency, val]) => (
          <div key={currency} className="flex items-center gap-2">
            <label className="text-sm w-12">{currency}</label>
            <Input
              type="number"
              value={val}
              onChange={(e) => setTotalByCurrency({ ...totalByCurrency, [currency]: Number(e.target.value) })}
              className="flex-1"
            />
          </div>
        ))}
      </div>

      <div className="mb-2 flex justify-between">
        <h4 className="font-semibold text-sm">Kategori & Alokasi (%)</h4>
        <span className={`text-sm font-semibold ${totalPercent !== 100 ? "text-red-500" : "text-green-600"}`}>
          Total: {totalPercent}%
        </span>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {categories.map((cat, idx) => (
            <SortableItem
              key={cat.id}
              id={cat.id}
              index={idx}
              item={cat}
              onChange={handleChange}
              onRemove={handleRemove}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex gap-2 mt-4">
        <Button onClick={handleAdd} variant="outline">➕ Tambah Pos</Button>
        <Button onClick={handleUndo} variant="secondary">↩️ Undo</Button>
        <Button onClick={handleReset} variant="destructive">🔁 Reset</Button>
      </div>

      <h4 className="font-semibold text-sm mt-6 mb-2">Hasil Split</h4>
      <div className="space-y-4">
        {result.map((cat, idx) => (
          <div key={idx} className="border rounded p-3">
            <div className="font-semibold mb-2">💼 {cat.name} ({cat.percent}%)</div>
            <ul className="text-sm text-gray-700 space-y-1">
              {Object.entries(cat.values).map(([curr, val]) => (
                <li key={curr}>
                  {curr}: {val.toLocaleString("id-ID", { style: "currency", currency: curr })}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
