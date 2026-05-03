import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'whatchueattoday',
  description: 'see what everyone\'s eating & get inspired',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="whatchueattoday" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="whatchueattoday" />
        <meta name="theme-color" content="#E85D04" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
            <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
              appId: "bd405098-83b0-4988-893d-f75d4d38d0f1",
            });
          });
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
