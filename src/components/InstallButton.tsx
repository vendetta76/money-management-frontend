
import React, { useEffect, useState, useRef } from 'react'

const InstallButton = () => {
  const [canInstall, setCanInstall] = useState(false)
  const deferredPrompt = useRef<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler as EventListener)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt.current) return
    const promptEvent = deferredPrompt.current as any
    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') {
      console.log('✅ PWA installed')
    }
    deferredPrompt.current = null
    setCanInstall(false)
  }

  if (!canInstall) return null

  return (
    <button
      onClick={handleInstall}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
      📲 Install MoniQ
    </button>
  )
}

export default InstallButton
