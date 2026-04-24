import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'whatchueattoday',
  description: 'see what everyone\'s eating & get inspired ✨',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
