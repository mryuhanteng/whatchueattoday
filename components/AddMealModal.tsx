'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

const EMOJIS = ['🍕','🍜','🍣','🍔','🥗','🌮','🍱','🥪','🍛','🧆','🥘','🍝','🥩','🍗','🥞','🍳','🥐','🍱','🫕','🥙']

export default function AddMealModal({ userId, onClose, onPosted }: {
  userId: string; onClose: () => void; onPosted: () => void
}) {
  const [selectedEmoji, setSelectedEmoji] = useState('🍕')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function submit() {
    if (!name.trim()) { setError('what did you eat tho? 👀'); return }
    setLoading(true)
    const { error } = await supabase.from('meals').insert({
      user_id: userId, emoji: selectedEmoji,
      name: name.trim(), description: desc.trim()
    })
    if (error) { setError(error.message); setLoading(false); return }
    onPosted()
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
      }}
    >
      <div style={{
        background: 'var(--bg)', borderRadius: '28px 28px 0 0',
        padding: '24px 24px 48px', width: '100%', maxWidth: '430px'
      }}>
        <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 4, margin: '0 auto 20px' }} />
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>what did you eat? 🍴</div>

        <div className="input-group">
          <label className="input-label">pick an emoji</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EMOJIS.map(e => (
              <span key={e} onClick={() => setSelectedEmoji(e)} style={{
                fontSize: 26, padding: '6px 8px', borderRadius: 12, cursor: 'pointer',
                border: selectedEmoji === e ? '2px solid var(--orange)' : '2px solid transparent',
                background: selectedEmoji === e ? 'var(--orange-light)' : 'transparent',
                transition: 'all 0.15s'
              }}>{e}</span>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">meal name</label>
          <input className="text-input" placeholder="e.g. spicy tonkotsu ramen"
            value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>

        <div className="input-group">
          <label className="input-label">say more (optional)</label>
          <input className="text-input" placeholder="it was bussin no cap 🔥"
            value={desc} onChange={e => setDesc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn-primary" disabled={loading} onClick={submit}>
          {loading ? 'posting...' : 'post it 🚀'}
        </button>
        <button className="btn-ghost" onClick={onClose}>cancel</button>
      </div>
    </div>
  )
}
