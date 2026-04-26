import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'whatchueattoday',
  description: 'see what everyone\'s eating & get inspired',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍽️</text></svg>",
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
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
