'use client'
import { Meal } from '@/app/feed/page'
import { createClient } from '@/lib/supabase-browser'

const EMOJI_LOVE = String.fromCodePoint(0x1F60D)
const EMOJI_FIRE = String.fromCodePoint(0x1F525)
const EMOJI_LOL = String.fromCodePoint(0x1F602)
const EMOJI_PLATE = String.fromCodePoint(0x1F37D) + String.fromCodePoint(0xFE0F)
const DEFAULT_EMOJIS = [EMOJI_LOVE, EMOJI_FIRE, EMOJI_LOL]

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

  async function handleDelete() {
    if (!confirm('delete this meal?')) return
    await supabase.from('meals').delete().eq('id', meal.id)
    if (onDelete) onDelete(meal.id)
  }

  return (
    <div className="meal-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div className="avatar" style={{ background: profile?.avatar_color || '#FFE8D6' }}>
          {profile?.avatar_emoji || EMOJI_PLATE}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800 }}>@{profile?.username || 'anon'}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{timeAgo(meal.created_at)}</div>
        </div>
        {isMe && (
          <span style={{
            marginLeft: 'auto', background: 'var(--orange-light)', color: 'var(--orange)',
            fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 8
          }}>you</span>
        )}
        {isMe && (
          <button onClick={handleDelete} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 16, color: 'var(--muted)', padding: '2px 6px'
          }}>x</button>
        )}
      </div>

      <span style={{ fontSize: 40, marginBottom: 6, display: 'block' }}>{meal.emoji}</span>
      {meal.photo_url && (
        <img src={meal.photo_url} alt={meal.name} styl