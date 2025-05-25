import { useEffect, useState } from "react"

export type ThemeMode = "light" | "dark"

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem("theme") as ThemeMode;
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
      // Default to system preference if no saved theme
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch (e) {
      console.warn("⚠️ Gagal ambil theme dari localStorage:", e)
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
  })

  useEffect(() => {
    const root = document.documentElement

    // Reset semua class theme
    root.classList.remove("dark", "light")

    // Apply theme
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.add("light")
    }

    // Tailwind repaint fix
    document.body.style.display = "none"
    document.body.offsetHeight
    document.body.style.display = ""

    try {
      localStorage.setItem("theme", theme)
    } catch (e) {
      console.warn("⚠️ Gagal simpan theme ke localStorage:", e)
    }
  }, [theme])

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(mode)
  }

  return { theme, setThemeMode }
}