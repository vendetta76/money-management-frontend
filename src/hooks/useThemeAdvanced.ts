import { useEffect, useState } from "react"

export type ThemeMode = "original" | "system" | "light" | "dark"

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme") as ThemeMode) || "system"
  })

  useEffect(() => {
    const root = document.documentElement

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", prefersDark)
      root.classList.toggle("original", false)
    } else {
      root.classList.toggle("dark", theme === "dark")
      root.classList.toggle("original", theme === "original")
    }

    localStorage.setItem("theme", theme)
  }, [theme])

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(mode)
  }

  return { theme, setThemeMode }
}
