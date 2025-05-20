import { useEffect, useState } from "react"

export type ThemeMode = "system" | "light" | "dark" | "original" | "warm"

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem("theme") as ThemeMode) || "system"
    } catch (e) {
      console.warn("⚠️ Gagal ambil theme dari localStorage:", e)
      return "system"
    }
  })

  useEffect(() => {
    const root = document.documentElement

    // Reset semua class theme
    root.classList.remove("original", "warm", "dark", "system")

    const applyTheme = (mode: ThemeMode) => {
      if (mode === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        root.classList.add("system") // optional class, bisa dihapus kalau nggak perlu
        root.classList.toggle("dark", prefersDark)
        return
      }

      if (mode === "dark") root.classList.add("dark")
      if (mode === "original") root.classList.add("original")
      if (mode === "warm") root.classList.add("warm")
      // "light" mode: no class added
    }

    applyTheme(theme)

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