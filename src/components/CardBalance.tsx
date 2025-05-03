import { useState } from "react"

interface CardBalanceProps {
  initialBalance: number
  cardHolder: string
  cardNumber: string
  expiry: string
}

const currencies = [
  { label: "Rupiah (IDR)", code: "IDR", locale: "id-ID" },
  { label: "Baht (THB)", code: "THB", locale: "th-TH" },
  { label: "Dollar (USD)", code: "USD", locale: "en-US" },
  { label: "Euro (EUR)", code: "EUR", locale: "de-DE" },
  { label: "Yen (JPY)", code: "JPY", locale: "ja-JP" },
]

const CardBalance = ({ initialBalance, cardHolder, cardNumber, expiry }: CardBalanceProps) => {
  const [currency, setCurrency] = useState("IDR")
  const [locale, setLocale] = useState("id-ID")
  const [searchTerm, setSearchTerm] = useState("")
  const [balance, setBalance] = useState(initialBalance)

  const formatCurrency = (amount: number, currencyCode: string, localeStr: string) => {
    return new Intl.NumberFormat(localeStr, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredCurrencies = currencies.filter((c) =>
    c.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCurrencyChange = (code: string, localeStr: string) => {
    setCurrency(code)
    setLocale(localeStr)
  }

  return (
    <div className="rounded-xl text-white shadow-md p-6 w-full bg-gradient-to-br from-purple-600 to-indigo-700">
      <div className="flex justify-between items-start mb-4">
        <div className="text-sm font-medium">Total Saldo</div>
        <div className="text-sm bg-white text-gray-800 p-2 rounded shadow-md">
          <input
            type="text"
            placeholder="Cari mata uang..."
            className="text-xs px-2 py-1 w-full border-b border-gray-200 mb-2 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ul className="max-h-32 overflow-y-auto">
            {filteredCurrencies.map((c) => (
              <li
                key={c.code}
                onClick={() => handleCurrencyChange(c.code, c.locale)}
                className={`cursor-pointer px-2 py-1 hover:bg-gray-100 text-xs ${
                  currency === c.code ? "font-bold text-purple-600" : ""
                }`}
              >
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-2xl font-bold mb-6">{formatCurrency(balance, currency, locale)}</div>

      <div className="flex justify-between text-xs">
        <div>
          <div className="text-gray-200">Nomor Kartu</div>
          <div className="tracking-widest font-semibold">{cardNumber}</div>
        </div>
        <div>
          <div className="text-gray-200">Berlaku</div>
          <div className="font-semibold">{expiry}</div>
        </div>
      </div>

      <div className="mt-6 text-sm font-semibold">{cardHolder}</div>
    </div>
  )
}

export default CardBalance
