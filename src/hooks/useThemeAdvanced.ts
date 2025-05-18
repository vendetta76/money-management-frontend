import { useEffect, useState } from "react"

export type ThemeMode = "system" | "light" | "dark" | "original" | "warm"

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme") as ThemeMode) || "system"
  })

  useEffect(() => {
    const root = document.documentElement

    // Reset all theme classes first
    root.classList.remove("original", "warm", "dark")

    // Apply theme-specific classes
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", prefersDark)
    } else {
      // Apply dark class explicitly for dark theme
      if (theme === "dark") {
        root.classList.add("dark")
      }
      
      // Apply theme-specific classes
      if (theme === "original") root.classList.add("original")
      if (theme === "warm") root.classList.add("warm")
    }

    // Force a repaint to ensure all elements update
    document.body.style.display = 'none'
    document.body.offsetHeight // Trigger a reflow
    document.body.style.display = ''

    localStorage.setItem("theme", theme)
  }, [theme])

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(mode)
  }

  return { theme, setThemeMode }
}
