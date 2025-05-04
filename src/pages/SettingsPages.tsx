// Settings/Profile Page
export const ProfilePage = () => {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">👤 Profil Saya</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              disabled
              value="user@example.com"
              className="w-full px-4 py-2 border rounded-lg bg-gray-200 text-gray-600"
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Simpan Perubahan</button>
        </form>
      </div>
    )
  }
  
  // Settings/Security Page
  export const SecurityPage = () => {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🔐 Keamanan</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kata Sandi Baru</label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Konfirmasi Kata Sandi</label>
            <input
              type="password"
              placeholder="Ulangi kata sandi"
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
            />
          </div>
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">Perbarui Kata Sandi</button>
        </form>
      </div>
    )
  }
  
  // Settings/Preferences Page
  export const PreferencesPage = () => {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark")
  
    useEffect(() => {
      document.documentElement.classList.toggle("dark", darkMode)
      localStorage.setItem("theme", darkMode ? "dark" : "light")
    }, [darkMode])
  
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">⚙️ Preferensi</h1>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Mode Gelap</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-400 rounded-full peer dark:bg-gray-700 peer-checked:bg-purple-600 relative transition duration-300">
              <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-4" />
            </div>
          </label>
        </div>
      </div>
    )
  }
  