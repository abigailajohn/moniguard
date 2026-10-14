// Tracks whether the app can be installed, and offers it.
// Android/desktop Chrome fire "beforeinstallprompt"; iPhone needs Share → Add to Home Screen.
import { useEffect, useState } from 'react'

let deferred = null
const listeners = new Set()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; listeners.forEach((f) => f()) })
  window.addEventListener('appinstalled', () => { deferred = null; listeners.forEach((f) => f()) })
}

export const isStandalone = () => typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true)
export const isIos = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent)

export function useInstall() {
  const [, tick] = useState(0)
  useEffect(() => { const f = () => tick((n) => n + 1); listeners.add(f); return () => listeners.delete(f) }, [])
  const installed = isStandalone()
  return {
    installed,
    canPrompt: !!deferred && !installed,
    ios: isIos() && !installed,
    prompt: async () => { if (!deferred) return false; deferred.prompt(); const r = await deferred.userChoice.catch(() => null); deferred = null; tick((n) => n + 1); return r?.outcome === 'accepted' },
  }
}
