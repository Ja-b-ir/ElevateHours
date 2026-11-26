'use client'
import { useEffect, useState } from 'react'
import { Download, X, Share, PlusSquare, MoreVertical } from 'lucide-react'

// Registers the service worker (needed for the app to be installable).
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}

// "Install App" button.
//   <InstallApp variant="nav" />   small button for the top bar
//   <InstallApp variant="hero" />  large button for the hero section
export default function InstallApp({ variant = 'hero' }) {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    if (standalone) { setInstalled(true); return }

    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

    const onPrompt = (e) => { e.preventDefault(); setDeferred(e) }
    const onInstalled = () => { setInstalled(true); setDeferred(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null

  const handleClick = async () => {
    if (deferred) {
      deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setDeferred(null)
    } else {
      setShowHelp(true) // iPhone/iPad, or a browser with no install prompt
    }
  }

  const isNav = variant === 'nav'
  const buttonStyle = isNav
    ? { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand)', fontWeight: 600, fontSize: '0.875rem', padding: '0.45rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--brand)', background: 'var(--brand-light)', whiteSpace: 'nowrap', cursor: 'pointer' }
    : { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--amber)', color: '#0C1024', padding: '0.875rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }

  const step = { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-2)' }

  return (
    <>
      <button type="button" onClick={handleClick} className="eh-btn" style={buttonStyle}>
        <Download size={isNav ? 14 : 16} /> {isNav ? 'Install' : 'Install App'}
      </button>

      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', width: '100%', maxWidth: 420, textAlign: 'left' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ color: 'var(--text)' }}>Install ElevateHours</h3>
              <button onClick={() => setShowHelp(false)} aria-label="Close" style={{ background: 'transparent', color: 'var(--text-3)' }}><X size={18} /></button>
            </div>

            {isIOS ? (
              <>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '0.5rem' }}>On iPhone / iPad, open this page in Safari, then:</p>
                <div style={step}><Share size={18} color="var(--brand)" /> 1. Tap the Share button</div>
                <div style={step}><PlusSquare size={18} color="var(--brand)" /> 2. Choose "Add to Home Screen"</div>
                <div style={{ ...step, borderBottom: 'none' }}><Download size={18} color="var(--brand)" /> 3. Tap "Add"</div>
              </>
            ) : (
              <>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '0.5rem' }}>Your browser didn't show the install pop-up. You can still install it:</p>
                <div style={step}><MoreVertical size={18} color="var(--brand)" /> 1. Open the browser menu (⋮)</div>
                <div style={{ ...step, borderBottom: 'none' }}><Download size={18} color="var(--brand)" /> 2. Tap "Install app" or "Add to Home screen"</div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
