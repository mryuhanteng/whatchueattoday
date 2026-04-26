'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const EMOJI_PLATE = String.fromCodePoint(0x1F37D) + String.fromCodePoint(0xFE0F)
const EMOJI_THINK = String.fromCodePoint(0x1F914)
const EMOJI_FIRE = String.fromCodePoint(0x1F525)
const EMOJI_EYES = String.fromCodePoint(0x1F440)
const EMOJI_POINT = String.fromCodePoint(0x1F447)
const EMOJI_SUN = String.fromCodePoint(0x2600) + String.fromCodePoint(0xFE0F)
const EMOJI_STORM = String.fromCodePoint(0x26C8) + String.fromCodePoint(0xFE0F)
const EMOJI_WAVE = String.fromCodePoint(0x1F44B)
const EMOJI_SPARKLE = String.fromCodePoint(0x2728)

const SLIDES = [
  {
    emoji: EMOJI_THINK,
    title: "don't know what to eat today?",
    subtitle: "i don't know either.",
    body: "but others do. and now you can steal their ideas.",
    meme: "me at 12pm staring at the fridge for 20 mins",
  },
  {
    emoji: EMOJI_PLATE,
    title: "so we built this.",
    subtitle: "whatchueattoday",
    body: "a place where people post what they're eating — breakfast, lunch, dinner, snacks, drinks. no recipes. no calorie counts. just vibes.",
    meme: "finally, a social app that gets me",
  },
  {
    emoji: EMOJI_EYES,
    title: "how it works",
    subtitle: "it's literally 3 taps.",
    body: "tap + to post what you ate. pick an emoji. add a photo if you're feeling fancy. done. your meal is now inspiring someone.",
    meme: "even your 3am ramen counts",
  },
  {
    emoji: EMOJI_SUN + EMOJI_STORM,
    title: "react to what people eat",
    subtitle: "two moods only.",
    body: EMOJI_SUN + " = yasss that looks good\n" + EMOJI_STORM + " = bestie no.",
    meme: "we don't do fake positivity here",
  },
  {
    emoji: EMOJI_FIRE,
    title: "ready?",
    subtitle: "go see what everyone's eating.",
    body: "your next meal idea is literally one scroll away. you're welcome.",
    meme: "let's eat " + EMOJI_WAVE,
  },
]

export default function OnboardingPage() {
  const [slide, setSlide] = useState(0)
  const router = useRouter()
  const current = SLIDES[slide]

  function next() {
    if (slide < SLIDES.length - 1) {
      setSlide(slide + 1)
    } else {
      localStorage.setItem('onboarded', 'true')
      window.location.href = '/feed'
    }
  }

  function skip() {
    localStorage.setItem('onboarded', 'true')
    window.location.href = '/feed'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '48px 32px 40px'
    }}>
      <button onClick={skip} style={{
        alignSelf: 'flex-end', background: 'none', border: 'none',
        fontSize: 13, fontWeight: 700, color: 'var(--muted)', cursor: 'pointer'
      }}>skip</button>

      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: 72 }}>{current.emoji}</div>

        <div style={{
          fontSize: 22, fontWeight: 900, color: 'var(--orange)',
          lineHeight: 1.3, textAlign: 'center'
        }}>{current.title}</div>

        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{current.subtitle}</div>

        <div style={{
          fontSize: 14, color: 'var(--muted)', lineHeight: 1.6,
          textAlign: 'center', whiteSpace: 'pre-line'
        }}>{current.body}</div>

        <div style={{
          background: 'var(--surface)', borderRadius: 16,
          padding: '12px 20px', fontSize: 13, fontWeight: 700,
          color: 'var(--muted)', marginTop: 8, textAlign: 'center'
        }}>
          💬 "{current.meme}"
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              width: i === slide ? 20 : 8, height: 8,
              borderRadius: 4, background: i === slide ? 'var(--orange)' : 'var(--border)',
              transition: 'all 0.3s'
            }} />
          ))}
        </div>

        <button onClick={next} style={{
          width: '100%', padding: '16px', borderRadius: 18,
          background: 'var(--orange)', border: 'none', color: 'white',
          fontSize: 16, fontWeight: 900, cursor: 'pointer'
        }}>
          {slide < SLIDES.length - 1 ? 'next ' + EMOJI_SPARKLE : "let's eat " + EMOJI_WAVE}
        </button>
      </div>
    </div>
  )
}
