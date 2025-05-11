import React, { useEffect, useState, useRef } from 'react'

const InstallButton = () => {
  const [canInstall, setCanInstall] = useState(false)
  const deferredPrompt = useRef<any>(null)

  useEffect(() => {
    const handler = (e: any) => {
      console.log("✅ beforeinstallprompt event triggered")
      e.preventDefault()
      deferredPrompt.current = e
      setCanInstall(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt.current) return
    deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') {
      console.log('✅ User accepted the install prompt')
    } else {
      console.log('❌ User dismissed the install prompt')
    }
    deferredPrompt.current = null
    setCanInstall(false)
  }

  // For DEV testing only
  // useEffect(() => setCanInstall(true), []) // uncomment to always show

  if (!canInstall) return null

  return (
    <button
      onClick={handleInstall}
      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
      📲 Install
    </button>
  )
}

export default InstallButton
