import { useEffect, useState } from "react"

export type ThemeMode = "system" | "light" | "dark" | "original" | "warm"

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme") as ThemeMode) || "system"
  })

  useEffect(() => {
    const root = document.documentElement

    // Reset class original & warm
    root.classList.remove("original", "warm")

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", prefersDark)
    } else {
      root.classList.toggle("dark", theme === "dark")
      if (theme === "original") root.classList.add("original")
      if (theme === "warm") root.classList.add("warm")
    }

    localStorage.setItem("theme", theme)
  }, [theme])

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(mode)
  }

  return { theme, setThemeMode }
}