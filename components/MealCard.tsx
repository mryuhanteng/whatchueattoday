'use client'
import { Meal } from '@/app/feed/page'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function MealCard({ meal, currentUserId, onReact }: {
  meal: Meal; currentUserId: string; onReact: (mealId: string, emoji: string) => void
}) {
  const isMe = meal.user_id === currentUserId
  const profile = meal.profiles

  return (
    <div className="meal-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div className="avatar" style={{ background: profile?.avatar_color || '#FFE8D6' }}>
          {profile?.avatar_emoji || '🍽️'}
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
        {meal.reactions.filter(r => r.count > 0 || ['😍','🔥','😂'].includes(r.emoji)).map(r => (
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
  )
}