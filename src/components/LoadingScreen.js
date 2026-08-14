'use client'
import { useEffect, useState } from 'react'

export default function LoadingScreen({ text = 'Loading...' }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') || 'light'
    setTheme(current)
  }, [])

  const src = theme === 'dark' ? '/loading/loading-dark.png' : '/loading/loading-white.png'

  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem'
    }}>
      <div className="eh-loader-wrap">
        <img src={src} alt="Loading" className="eh-loader-img" />
      </div>

      <div className="eh-loader-text">{text}</div>

      <style>{`
        .eh-loader-wrap {
          width: 200px;
          height: 110px;
          position: relative;
          clip-path: inset(0 100% 0 0);
          animation: eh-loader-reveal 1.3s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        .eh-loader-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 200px;
          height: 110px;
          object-fit: contain;
          transform-origin: 88% 38%;
          animation: eh-loader-pulse 1.4s ease-in-out infinite;
          animation-delay: 1.3s;
          animation-fill-mode: backwards;
        }
        @keyframes eh-loader-reveal {
          from { clip-path: inset(0 100% 0 0); }
          to { clip-path: inset(0 0% 0 0); }
        }
        @keyframes eh-loader-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .eh-loader-text {
          color: var(--text-3);
          font-size: 0.875rem;
          font-weight: 600;
          animation: eh-loader-text-pulse 1.6s ease-in-out infinite;
        }
        @keyframes eh-loader-text-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .eh-loader-wrap {
            animation: none !important;
            clip-path: inset(0 0% 0 0) !important;
          }
          .eh-loader-img, .eh-loader-text {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
