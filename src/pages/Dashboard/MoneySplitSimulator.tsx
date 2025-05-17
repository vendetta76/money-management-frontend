import { formatCurrency } from "../helpers/formatCurrency";
import { useEffect, useState } from "react"
import { DndContext, closestCenter } from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// UI Components
const Input = ({ ...props }) => (
  <input
    {...props}
    className="px-3 py-2 border rounded w-full focus:outline-none focus:ring"
  />
)

const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition ${className}`}
  >
    {children}
  </button>
)

function SortableItem({ id, item, onChange, onRemove, isOverLimit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id,
    transition: { duration: 250, easing: "ease" }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex gap-2 items-center mb-2"
    >
      <Input
        value={item.name}
        onChange={(e) => onChange(id, "name", e.target.value)}
        placeholder="Nama Pos"
      />
      <div className="relative w-20">
        <Input
          type="text"
          value={item.percent}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "")
            const clean = raw.replace(/^0+/, "")
            onChange(id, "percent", clean)
          }}
          className={`text-right ${isOverLimit ? "border-red-500 text-red-600" : ""}`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="text-red-600 px-2 py-1 rounded hover:bg-red-100"
        title="Hapus Pos"
      >
        ❌
      </button>
      <span
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600"
        title="Drag Posisi"
      >
        ≡
      </span>
    </div>
  )
}

export default function MoneySplitAdvanced() {
  const availableCurrencies = ["IDR", "USD", "THB"]
  const [selectedCurrency, setSelectedCurrency] = useState("")
  const [total, setTotal] = useState(0)

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("moneySplitCategories")
    return saved
      ? JSON.parse(saved)
      : [
          { id: "1", name: "Tabungan", percent: 30 },
          { id: "2", name: "Investasi", percent: 25 },
          { id: "3", name: "Kebutuhan", percent: 35 },
          { id: "4", name: "Hiburan", percent: 5 },
          { id: "5", name: "Lainnya", percent: 5 },
        ]
  })

  const [prevCategories, setPrevCategories] = useState(null)
  const totalPercent = categories.reduce((sum, item) => sum + item.percent, 0)
  const isOverLimit = totalPercent !== 100 // Define isOverLimit based on totalPercent

  useEffect(() => {
    localStorage.setItem("moneySplitCategories", JSON.stringify(categories))
  }, [categories])

  const handleChange = (id, field, value) => {
    const updated = categories.map((cat) =>
      cat.id === id
        ? {
            ...cat,
            [field]: field === "percent" ? parseFloat(value) || 0 : value,
          }
        : cat
    )
    setPrevCategories(categories)
    setCategories(updated)
  }

  const handleAdd = () => {
    setPrevCategories(categories)
    setCategories([
      ...categories,
      { id: Date.now().toString(), name: "Baru", percent: 0 },
    ])
  }

  const handleRemove = (id) => {
    setPrevCategories(categories)
    setCategories(categories.filter((cat) => cat.id !== id))
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

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    setPrevCategories(categories)
    setCategories(arrayMove(categories, oldIndex, newIndex))
  }

  const result = categories.map((cat) => {
    const value = (total * cat.percent) / 100
    return { ...cat, value }
  })

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Money Split Simulator</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Pilih Mata Uang</label>
        <select
          value={selectedCurrency}
          onChange={(e) => {
            setSelectedCurrency(e.target.value)
            setTotal(0)
          }}
          className="px-4 py-2 border rounded w-full"
        >
          <option value="">-- Pilih Mata Uang --</option>
          {availableCurrencies.map((cur) => (
            <option key={cur} value={cur}>
              {cur}
            </option>
          ))}
        </select>
      </div>

      {selectedCurrency && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Total Uang ({selectedCurrency})
            </label>
           <Input
  type="text"
  value={formatCurrency(total, selectedCurrency)}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "")
                setTotal(Number(raw))
              }}
            />
          </div>

          <div className="mb-2 flex justify-between">
            <h4 className="font-semibold text-sm">Kategori & Alokasi (%)</h4>
            <span
              className={`text-sm font-semibold ${
                totalPercent !== 100 ? "text-red-500" : "text-green-600"
              }`}
            >
              Total: {totalPercent}%
            </span>
          </div>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {categories.map((cat) => (
                <SortableItem
                  key={cat.id}
                  id={cat.id}
                  item={cat}
                  onChange={handleChange}
                  onRemove={handleRemove}
                  isOverLimit={isOverLimit}
                />
              ))}
            </SortableContext>
          </DndContext>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
              ➕ Tambah Pos
            </Button>
            <Button onClick={handleUndo} className="bg-gray-500 hover:bg-gray-600">
              ↩️ Undo
            </Button>
            <Button onClick={handleReset} className="bg-red-600 hover:bg-red-700">
              🔁 Reset
            </Button>
          </div>

          <h4 className="font-semibold text-sm mt-6 mb-2">Hasil Split</h4>
          <div className="space-y-4">
            {result.map((cat, idx) => (
              <div key={idx} className="border rounded p-3">
                <div className="font-semibold mb-2">
                  💼 {cat.name} ({cat.percent}%)
                </div>
                <div className="text-sm text-gray-700">
                  {cat.value.toLocaleString("id-ID", {
                    style: "currency",
                    currency: selectedCurrency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}