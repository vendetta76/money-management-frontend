import { ReactNode } from "react"
import clsx from "clsx"

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative"
  icon?: ReactNode
}

const StatCard = ({ title, value, change, changeType, icon }: StatCardProps) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4 w-full">
      {icon && <div className="text-3xl text-purple-600">{icon}</div>}
      <div>
        <h4 className="text-sm text-gray-500 font-medium">{title}</h4>
        <p className="text-xl font-bold">{value}</p>
        <p
          className={clsx(
            "text-xs font-medium",
            changeType === "positive" ? "text-green-600" : "text-red-600"
          )}
        >
          {change}
        </p>
      </div>
    </div>
  )
}

export default StatCard
