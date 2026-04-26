'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import AddMealModal from '@/components/AddMealModal'
import MealCard from '@/components/MealCard'

export type Profile = { id: string; username: string; avatar_emoji: string; avatar_color: string }
export type Meal = {
  id: string; user_id: string; emoji: string; name: string; description: string;
  photo_url: string | null; category: string;
  created_at: string; profiles: Profile;
  reactions: { emoji: string; count: number; user_reacted: boolean }[]
}

const EMOJI_PLATE = String.fromCodePoint(0x1F37D) + String.fromCodePoint(0xFE0F)
const EMOJI_WAVE = String.fromCodePoint(0x1F44B)
const EMOJI_FIRE = String.fromCodePoint(0x1F525)
const EMOJI_SUN = String.fromCodePoint(0x2600) + String.fromCodePoint(0xFE0F)
const EMOJI_STORM = String.fromCodePoint(0x26C8) + String.fromCodePoint(0xFE0F)
const DEFAULT_EMOJIS = [EMOJI_SUN, EMOJI_STORM]

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'breakfast', label: '🍳 Breakfast' },
  { id: 'lunch', label: '🥪 Lunch' },
  { id: 'dinner', label: '🍽️ Dinner' },
  { id: 'snack', label: '🥿 Snack' },
  { id: 'drinks', label: '🥤 Drinks' },
]

export default function FeedPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [me, setMe] = useState<Profile | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const supabase = createClient()
  const router = useRouter()

  const loadMe = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setMe(data)
  }, [supabase, router])

  const loadMeals = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: mealsData } = await supabase
      .from('meals')
      .select('*, profiles(*)')
      .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (!mealsData) { setLoading(false); return }

    const { data: reactionsData } = await supabase
      .from('reactions')
      .select('meal_id, emoji, user_id')

    const mealsWithReactions = mealsData.map((meal: any) => {
      const mealReactions = reactionsData?.filter(r => r.meal_id === meal.id) || []
      const reactionMap: Record<string, { count: number; user_reacted: boolean }> = {}
      for (const r of mealReactions) {
        if (!reactionMap[r.emoji]) reactionMap[r.emoji] = { count: 0, user_reacted: false }
        reactionMap[r.emoji].count++
        if (r.user_id === user.id) reactionMap[r.emoji].user_reacted = true
      }
      const reactions = Object.entries(reactionMap).map(([emoji, v]) => ({ emoji, ...v }))
      for (const e of DEFAULT_EMOJIS) {
        if (!reactions.find(r => r.emoji === e)) reactions.push({ emoji: e, count: 0, user_reacted: false })
      }
      return { ...meal, reactions }
    })

    setMeals(mealsWithReactions)
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadMe(); loadMeals() }, [loadMe, loadMeals])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  async function handleReact(mealId: string, emoji: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const existing = await supabase
      .from('reactions').select('id')
      .eq('meal_id', mealId).eq('user_id', user.id).eq('emoji', emoji)
      .maybeSingle()
    if (existing.data) {
      await supabase.from('reactions').delete().eq('id', existing.data.id)
    } else {
      await supabase.from('reactions').insert({ meal_id: mealId, user_id: user.id, emoji })
    }
    loadMeals()
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const filteredMeals = filter === 'all' ? meals : meals.filter(m => m.category === filter)

  return (
    <div className="page-wrap">
      <div className="top-bar">
        <div className="top-bar-logo">{EMOJI_PLATE} whatchueattoday</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {me && (
            <span onClick={() => router.push(`/profile/${me.username}`)} style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700, cursor: 'pointer' }}>@{me.username}</span>
          )}
          <button onClick={handleLogout} style={{
            background: 'var(--surface)', border: 'none', borderRadius: 10,
            padding: '6px 12px', fontSize: 13, fontWeight: 700, color: 'var(--muted)'
          }}>log out</button>
        </div>
      </div>

      <div style={{ padding: '16px 20px 4px' }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>
          hey {me?.username ?? '...'} {EMOJI_WAVE}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{todayStr}</div>
      </div>

      <button onClick={() => setShowModal(true)} style={{
        margin: '14px 20px', padding: '14px',
        borderRadius: '18px', border: '2.5px dashed var(--orange)',
        background: 'var(--orange-light)', color: 'var(--orange)',
        fontSize: 15, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background 0.2s'
      }}>
        <span style={{ fontSize: 20 }}>+</span> add what you ate today
      </button>

      <div className="section-label">today's eats {EMOJI_FIRE}</div>

      <div style={{ padding: '0 20px 12px' }}>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{
          padding: '8px 14px', borderRadius: 12, border: '1.5px solid var(--border)',
          background: 'var(--surface)', fontSize: 13, fontWeight: 700,
          color: 'var(--text)', cursor: 'pointer', outline: 'none'
        }}>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 40 }}>
        {loading && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>loading...</p>}
        {!loading && filteredMeals.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0', fontSize: 15 }}>
            no {filter === 'all' ? 'meals' : filter} yet today {EMOJI_PLATE}<br />be the first to post!
          </p>
        )}
        {filteredMeals.map(meal => (
          <MealCard key={meal.id} meal={meal} currentUserId={me?.id ?? ''} onReact={handleReact} onDelete={(id) => setMeals(meals.filter(m => m.id !== id))} />
        ))}
      </div>

      {showModal && me && (
        <AddMealModal
          userId={me.id}
          onClose={() => setShowModal(false)}
          onPosted={() => { setShowModal(false); loadMeals() }}
        />
      )}
    </div>
  )
}
