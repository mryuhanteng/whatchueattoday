'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const EMOJI_PLATE = String.fromCodePoint(0x1F37D) + String.fromCodePoint(0xFE0F)
const EMOJI_SPARKLE = String.fromCodePoint(0x2728)

export default function WelcomePage() {
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      router.push('/feed')
    }, 3000)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16
    }}>
      <div style={{ fontSize: 80, animation: 'bounce 0.6s infinite alternate' }}>{EMOJI_PLATE}</div>
      <div style={{
        fontSize: 26, fontWeight: 900, color: 'var(--orange)',
        textAlign: 'center', padding: '0 32px', lineHeight: 1.4
      }}>
        so... whatchu eating today? {EMOJI_PLATE}
      </div>
      <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 4 }}>
        taking you to the feed {EMOJI_SPARKLE}
      </div>
      <style>{`
        @keyframes bounce {
          from { transform: translateY(0px); }
          to { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}
