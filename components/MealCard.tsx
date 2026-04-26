'use client'
import { useState, Fragment } from 'react'
import { Meal } from '@/app/feed/page'
import { createClient } from '@/lib/supabase-browser'

const EMOJI_PLATE = String.fromCodePoint(0x1F37D) + String.fromCodePoint(0xFE0F)
const EMOJI_SUN = String.fromCodePoint(0x2600) + String.fromCodePoint(0xFE0F)
const EMOJI_STORM = String.fromCodePoint(0x26C8) + String.fromCodePoint(0xFE0F)
const EMOJI_EYES = String.fromCodePoint(0x1F440)
const EMOJI_WAVE = String.fromCodePoint(0x1F44B)
const DEFAULT_EMOJIS = [EMOJI_SUN, EMOJI_STORM]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function MealCard({ meal, currentUserId, onReact, onDelete }: {
  meal: Meal
  currentUserId: string
  onReact: (mealId: string, emoji: string) => void
  onDelete?: (mealId: string) => void
}) {
  const isMe = meal.user_id === currentUserId
  const profile = meal.profiles
  const supabase = createClient()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('meals').delete().eq('id', meal.id)
    if (onDelete) onDelete(meal.id)
    setDeleting(false)
    setShowConfirm(false)
  }

  return (
    <Fragment>
      <div className="meal-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div className="avatar" style={{ background: profile?.avatar_color || '#FFE8D6' }}>
            {profile?.avatar_emoji || EMOJI_PLATE}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, cursor: 'pointer' }} onClick={() => window.location.href = `/profile/${profile?.username}`}>@{profile?.username || 'anon'}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{timeAgo(meal.created_at)}</div>
          </div>
          {isMe && (
            <span style={{
              marginLeft: 'auto', background: 'var(--orange-light)', color: 'var(--orange)',
              fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 8
            }}>you</span>
          )}
          {isMe && (
            <button onClick={() => setShowConfirm(true)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 16, color: 'var(--muted)', padding: '2px 6px'
            }}>x</button>
          )}
        </div>

        <span style={{ fontSize: 40, marginBottom: 6, display: 'block' }}>{meal.emoji}</span>
        {meal.photo_url && (
          <img src={meal.photo_url} alt={meal.name} style={{
            width: '100%', height: 200, objectFit: 'cover',
            borderRadius: 12, marginBottom: 8
          }} />
        )}
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 3 }}>{meal.name}</div>
        {meal.description && (
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{meal.description}</div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {meal.reactions.filter(r => r.count > 0 || DEFAULT_EMOJIS.includes(r.emoji)).map(r => (
            <button
              key={r.emoji}
              className={`reaction-btn ${r.user_reacted ? 'reacted' : ''}`}
              onClick={() => onReact(meal.id, r.emoji)}
            >
              {r.emoji} {r.count > 0 ? r.count : ''}
            </button>
          ))}
        </div>
      </div>

      {showConfirm && (
        <div onClick={() => setShowConfirm(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--bg)', borderRadius: '28px',
            padding: '32px 24px', width: '100%', maxWidth: '340px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>{EMOJI_EYES}</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, color: 'var(--orange)' }}>
              we gatekeeping?
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>
              this meal will be gone forever...<br />no take backs bestie {EMOJI_WAVE}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowConfirm(false)} style={{
                flex: 1, padding: '14px', borderRadius: 14,
                background: 'var(--surface)', border: 'none',
                fontWeight: 800, fontSize: 14, cursor: 'pointer', color: 'var(--muted)'
              }}>nvm keep it</button>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, padding: '14px', borderRadius: 14,
                background: 'var(--orange)', border: 'none',
                fontWeight: 800, fontSize: 14, cursor: 'pointer', color: 'white'
              }}>{deleting ? 'deleting...' : 'yes delete it'}</button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  )
}
