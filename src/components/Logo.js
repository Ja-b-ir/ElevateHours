'use client'
import { useState, useEffect } from 'react'

export default function Logo({ height = 28, style = {}, linkTo = '/', className = '', forceTheme = null }) {
  const [theme, setTheme] = useState('light')
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (forceTheme) return
    const current = document.documentElement.getAttribute('data-theme') || 'light'
    setTheme(current)

    // Watches for theme toggles happening anywhere else on the page (e.g. Navbar's
    // toggle button), since there's no shared theme context across pages.
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [forceTheme])

  const activeTheme = forceTheme || theme
  const src = activeTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'

  const content = imgError ? (
    // Falls back to the text logo if the image files aren't uploaded yet or fail to load
    <span style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.03em', color: 'var(--text)', whiteSpace: 'nowrap' }}>
      Elevate<span style={{ color: 'var(--brand)' }}>Hours</span>
    </span>
  ) : (
    <img
      src={src}
      alt="ElevateHours"
      style={{ height, width: 'auto', display: 'block', ...style }}
      onError={() => setImgError(true)}
    />
  )

  if (!linkTo) return content

  return (
    <a href={linkTo} className={className} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
      {content}
    </a>
  )
}
