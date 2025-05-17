import { useEffect, useRef, useState } from "react"
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { db } from "../lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

interface CardBalanceProps {
  initialBalance: number
  cardHolder: string
  cardNumber: string
  expiry: string
  compact?: boolean
}

const currencies = [
  { label: "Rupiah (IDR)", code: "IDR", locale: "id-ID" },
  { label: "Baht (THB)", code: "THB", locale: "th-TH" },
  { label: "Dollar (USD)", code: "USD", locale: "en-US" },
  { label: "Euro (EUR)", code: "EUR", locale: "de-DE" },
  { label: "Yen (JPY)", code: "JPY", locale: "ja-JP" },
]

const CardBalance = ({
  initialBalance,
  cardHolder,
  compact = false,
}: CardBalanceProps) => {
  const { user, userMeta } = useAuth()
  const [currency, setCurrency] = useState("IDR")
  const [locale, setLocale] = useState("id-ID")
  const [searchTerm, setSearchTerm] = useState("")
  const [balance] = useState(Number(initialBalance) || 0)
  const [showBalance, setShowBalance] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (userMeta?.preferredCurrency) {
      setCurrency(userMeta.preferredCurrency.code)
      setLocale(userMeta.preferredCurrency.locale)
    }
  }, [userMeta])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as any).contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const formatCurrency = (amount: number, currencyCode: string, localeStr: string) => {
    return formatCurrency(amount, currency)
  }

  const filteredCurrencies = currencies.filter((c) =>
    c.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCurrencyChange = async (code: string, localeStr: string) => {
    setCurrency(code)
    setLocale(localeStr)
    setDropdownOpen(false)

    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        preferredCurrency: { code, locale: localeStr },
      })
    }
  }

  return (
    <div className={`rounded-xl text-white shadow-md p-6 w-full bg-gradient-to-br from-purple-600 to-indigo-700 ${compact ? "text-sm" : ""}`}>
      {/* Label at top */}
      <div className="text-base font-semibold mb-3">{cardHolder}</div>

      {/* Action Buttons */}
      <div className="flex justify-between items-start mb-4 relative" ref={dropdownRef}>
        <div className="text-sm font-medium">Total Saldo</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-white"
            title={showBalance ? "Sembunyikan saldo" : "Tampilkan saldo"}
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-white"
            title="Ganti mata uang"
          >
            {dropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {dropdownOpen && (
            <div className="absolute top-10 right-0 z-50 text-black bg-white rounded shadow w-48 p-2">
              <input
                type="text"
                placeholder="Cari mata uang..."
                className="text-xs px-2 py-1 w-full border-b border-gray-200 mb-2 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <ul className="max-h-32 overflow-y-auto text-sm">
                {filteredCurrencies.map((c) => (
                  <li
                    key={c.code}
                    onClick={() => handleCurrencyChange(c.code, c.locale)}
                    className={`cursor-pointer px-2 py-1 hover:bg-gray-100 ${
                      currency === c.code ? "font-bold text-purple-600" : ""
                    }`}
                  >
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Balance */}
      <div className={`font-bold mb-2 ${compact ? "text-xl" : "text-2xl"}`}>
        {showBalance ? formatCurrency(balance, currency, locale) : "••••••••••"}
      </div>
    </div>
  )
}

export default CardBalance