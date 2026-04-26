'use client'
import { useEffect, useState, useCallback, Fragment } from 'react'
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
const EMOJI_BELL = String.fromCodePoint(0x1F514)
const EMOJI_SUN = String.fromCodePoint(0x2600) + String.fromCodePoint(0xFE0F)
const EMOJI_STORM = String.fromCodePoint(0x26C8) + String.fromCodePoint(0xFE0F)
const DEFAULT_EMOJIS = [EMOJI_SUN, EMOJI_STORM]

const EMOJI_EGG = String.fromCodePoint(0x1F373)
const EMOJI_SANDWICH = String.fromCodePoint(0x1F96A)
const EMOJI_SNACK = String.fromCodePoint(0x1F9C0)
const EMOJI_DRINK = String.fromCodePoint(0x1F964)

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'breakfast', label: EMOJI_EGG + ' Breakfast' },
  { id: 'lunch', label: EMOJI_SANDWICH + ' Lunch' },
  { id: 'dinner', label: EMOJI_PLATE + ' Dinner' },
  { id: 'snack', label: EMOJI_SNACK + ' Snack' },
  { id: 'drinks', label: EMOJI_DRINK + ' Drinks' },
]

export default function FeedPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [me, setMe] = useState<Profile | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifs, setNotifs] = useState<any[]>([])
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

  async function loadNotifs() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('notifications')
      .select('*, from_user:profiles!notifications_from_user_id_fkey(username, avatar_emoji, avatar_color), meal:meals(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) {
      setNotifs(data)
      setUnreadCount(data.filter((n: any) => !n.read).length)
    }
  }

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setUnreadCount(0)
    setNotifs(notifs.map(n => ({ ...n, read: true })))
  }

  useEffect(() => { loadMe(); loadMeals(); loadNotifs() }, [loadMe, loadMeals])

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
      const meal = meals.find(m => m.id === mealId)
      if (meal && meal.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: meal.user_id,
          from_user_id: user.id,
          meal_id: mealId,
          emoji
        })
      }
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
          <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markAllRead() }} style={{
            background: 'var(--surface)', border: 'none', borderRadius: 10,
            padding: '6px 10px', fontSize: 18, cursor: 'pointer', position: 'relative'
          }}>
            {EMOJI_BELL}
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2, background: 'red', color: 'white',
                borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{unreadCount}</span>
            )}
          </button>
          <button onClick={handleLogout} style={{
            background: 'var(--surface)', border: 'none', borderRadius: 10,
            padding: '6px 12px', fontSize: 13, fontWeight: 700, color: 'var(--muted)'
          }}>log out</button>
        </div>
      </div>

      {showNotifs && (
        <Fragment>
          <div onClick={() => setShowNotifs(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
          <div style={{
            position: 'fixed', top: 56, right: 12, zIndex: 200,
            background: 'var(--bg)', borderRadius: 18,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            width: 300, maxHeight: 400, overflowY: 'auto',
            border: '1.5px solid var(--border)'
          }}>
            <div style={{ padding: '16px 16px 8px', fontSize: 15, fontWeight: 900 }}>{EMOJI_BELL} notifications</div>
            {notifs.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0', fontSize: 13 }}>no notifications yet!</p>
            )}
            {notifs.map(n => (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                borderTop: '1px solid var(--border)',
                opacity: n.read ? 0.5 : 1
              }}>
                <div className="avatar" style={{ background: n.from_user?.avatar_color || '#FFE8D6', width: 32, height: 32, fontSize: 16, flexShrink: 0 }}>
                  {n.from_user?.avatar_emoji}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 800 }}>@{n.from_user?.username}</span> reacted {n.emoji} to your <span style={{ fontWeight: 800 }}>{n.meal?.name}</span>
                </div>
              </div>
            ))}
          </div>
        </Fragment>
      )}

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
