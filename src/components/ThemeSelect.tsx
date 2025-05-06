
// components/ThemeSelect.tsx
import { useTheme } from "../hooks/useThemeAdvanced"

const ThemeSelect = () => {
  const { theme, setThemeMode } = useTheme()

  return (
    <div className="w-full px-3 py-2">
      <label htmlFor="theme" className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
        🎨 Theme
      </label>
      <select
        id="theme"
        value={theme}
        onChange={(e) => setThemeMode(e.target.value)}
        className="w-full text-sm rounded px-2 py-1 border border-gray-300 dark:bg-gray-700 dark:text-white appearance-none transition duration-300 ease-in-out focus:ring-2 focus:ring-[#00d97e] focus:outline-none"
      >
          <option value="system">🖥️ Default</option>
          <option value="light">🌞 Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="original">🍃 Original</option>
          <option value="warm">🌿 Warm (Eye-Friendly)</option>

      </select>
    </div>
  )
}

export default ThemeSelect
