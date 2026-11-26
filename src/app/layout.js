import './globals.css'
import CookieConsent from "@/components/CookieConsent";
import { ServiceWorkerRegister } from '@/components/InstallApp'

export const metadata = {
  title: 'ElevateHours — Turn Your Skills Into Impact',
  description: 'A cashless time-barter marketplace powered by Sparks',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'ElevateHours',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  formatDetection: { telephone: false },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0D7377',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
