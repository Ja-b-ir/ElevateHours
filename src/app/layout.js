import './globals.css'

export const metadata = {
  title: 'ElevateHours — Turn Your Skills Into Impact',
  description: 'A cashless time-barter marketplace powered by Sparks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
