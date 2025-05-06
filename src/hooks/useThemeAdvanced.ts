// hooks/useTheme.ts
import { useEffect, useState } from "react"

export const useTheme = () => {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") || "light"
  )

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return { theme, toggleTheme }
}
