'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'

const EMOJIS = [
  String.fromCodePoint(0x1F355),
  String.fromCodePoint(0x1F35C),
  String.fromCodePoint(0x1F354),
  String.fromCodePoint(0x1F35E),
  String.fromCodePoint(0x1F363),
  String.fromCodePoint(0x1F357),
  String.fromCodePoint(0x1F956),
  String.fromCodePoint(0x1F362),
  String.fromCodePoint(0x1F366),
  String.fromCodePoint(0x1F367),
  String.fromCodePoint(0x1F365),
  String.fromCodePoint(0x1F96D),
  String.fromCodePoint(0x1F359),
  String.fromCodePoint(0x1F9C6),
  String.fromCodePoint(0x1F373),
  String.fromCodePoint(0x1F9C1),
  String.fromCodePoint(0x1F957),
  String.fromCodePoint(0x1F960),
  String.fromCodePoint(0x1F96A),
  String.fromCodePoint(0x1F9C0),
]

const EMOJI_CAMERA = String.fromCodePoint(0x1F4F7)
const EMOJI_CAMERA2 = String.fromCodePoint(0x1F4F7)
const EMOJI_FIRE = String.fromCodePoint(0x1F525)
const EMOJI_ROCKET = String.fromCodePoint(0x1F680)
const EMOJI_PLATE = String.fromCodePoint(0x1F37D) + String.fromCodePoint(0xFE0F)
const EMOJI_THINK = String.fromCodePoint(0x1F914)

const CATEGORIES = [
  { id: 'breakfast', label: 'Breakfast', emoji: String.fromCodePoint(0x1F373) },
  { id: 'lunch', label: 'Lunch', emoji: String.fromCodePoint(0x1F96A) },
  { id: 'dinner', label: 'Dinner', emoji: String.fromCodePoint(0x1F37D) + String.fromCodePoint(0xFE0F) },
  { id: 'snack', label: 'Snack', emoji: String.fromCodePoint(0x1F97F) },
  { id: 'drinks', label: 'Drinks', emoji: String.fromCodePoint(0x1F964) },
]

export default function AddMealModal({ userId, onClose, onPosted }: {
  userId: string; onClose: () => void; onPosted: () => void
}) {
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0])
  const [category, setCategory] = useState('breakfast')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function submit() {
    if (!name.trim()) { setError('what did you eat tho? ' + EMOJI_THINK); return }
    setLoading(true)

    let photo_url = null

    if (photo) {
      const ext = photo.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('meal-photos')
        .upload(path, photo, { upsert: true })
      if (uploadError) {
        setError('photo upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }
      const { data } = supabase.storage.from('meal-photos').getPublicUrl(path)
      photo_url = data.publicUrl
    }

    const { error } = await supabase.from('meals').insert({
      user_id: userId, emoji: selectedEmoji,
      name: name.trim(), description: desc.trim(),
      photo_url, category
    })
    if (error) { setError(error.message); setLoading(false); return }
    onPosted()
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div style={{
        background: 'var(--bg)', borderRadius: '28px',
        padding: '24px 24px 48px', width: '100%', maxWidth: '430px',
        maxHeight: 'calc(100vh - 60px)', overflowY: 'auto', marginBottom: '20px'
      }}>
        <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 4, margin: '0 auto 20px' }} />
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>what did you eat? {EMOJI_PLATE}</div>

        <div className="input-group">
          <label className="input-label">category</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)} style={{
                padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 13,
                background: category === c.id ? 'var(--orange)' : 'var(--surface)',
                color: category === c.id ? 'white' : 'var(--muted)',
                transition: 'all 0.15s'
              }}>{c.emoji} {c.label}</button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">add a photo {EMOJI_CAMERA}</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto}
            style={{ display: 'none' }} />
          {photoPreview ? (
            <div style={{ position: 'relative' }}>
              <img src={photoPreview} alt="preview" style={{
                width: '100%', height: 180, objectFit: 'cover',
                borderRadius: 16, border: '2px solid var(--border)'
              }} />
              <button onClick={() => { setPhoto(null); setPhotoPreview(null) }} style={{
                position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)',
                border: 'none', borderRadius: '50%', width: 28, height: 28,
                color: 'white', fontSize: 14, cursor: 'pointer'
              }}>x</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} style={{
              width: '100%', padding: '20px', borderRadius: 16,
              border: '2px dashed var(--border)', background: '#FAFAF8',
              fontSize: 14, fontWeight: 700, color: 'var(--muted)', cursor: 'pointer'
            }}>
              {EMOJI_CAMERA2} tap to add photo
            </button>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">pick an emoji</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EMOJIS.map((e, i) => (
              <span key={i} onClick={() => setSelectedEmoji(e)} style={{
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
          <input className="text-input" placeholder={'it was bussin no cap ' + EMOJI_FIRE}
            value={desc} onChange={e => setDesc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn-primary" disabled={loading} onClick={submit}>
          {loading ? 'posting...' : 'post it ' + EMOJI_ROCKET}
        </button>
        <button className="btn-ghost" onClick={onClose}>cancel</button>
      </div>
    </div>
  )
}
