'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter, useParams } from 'next/navigation'
import MealCard from '@/components/MealCard'
import { Meal } from '@/app/feed/page'

const EMOJI_BACK = String.fromCodePoint(0x2190)
const EMOJI_SUN = String.fromCodePoint(0x2600) + String.fromCodePoint(0xFE0F)
const EMOJI_STORM = String.fromCodePoint(0x26C8) + String.fromCodePoint(0xFE0F)
const EMOJI_EGG = String.fromCodePoint(0x1F373)
const EMOJI_SANDWICH = String.fromCodePoint(0x1F96A)
const EMOJI_PLATE = String.fromCodePoint(0x1F37D) + String.fromCodePoint(0xFE0F)
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

export default function ProfilePage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const username = params.username as string

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (!profileData) { setLoading(false); return }
      setProfile(profileData)

      // Load follow counts
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileData.id)

      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileData.id)

      setFollowerCount(followers || 0)
      setFollowingCount(following || 0)

      // Check if current user follows this profile
      if (user) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.id)
          .maybeSingle()
        setIsFollowing(!!followData)
      }

      const { data: mealsData } = await supabase
        .from('meals')
        .select('*, profiles(*)')
        .eq('user_id', profileData.id)
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
          if (r.user_id === user?.id) reactionMap[r.emoji].user_reacted = true
        }
        const reactions = Object.entries(reactionMap).map(([emoji, v]) => ({ emoji, ...v }))
        for (const e of [EMOJI_SUN, EMOJI_STORM]) {
          if (!reactions.find(r => r.emoji === e)) reactions.push({ emoji: e, count: 0, user_reacted: false })
        }
        return { ...meal, reactions }
      })

      setMeals(mealsWithReactions)
      setLoading(false)
    }
    load()
  }, [username])

  async function handleFollow() {
    if (!currentUserId || !profile) return
    setFollowLoading(true)
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', profile.id)
      setIsFollowing(false)
      setFollowerCount(c => c - 1)
    } else {
      await supabase.from('follows').insert({
        follower_id: currentUserId,
        following_id: profile.id
      })
      setIsFollowing(true)
      setFollowerCount(c => c + 1)
    }
    setFollowLoading(false)
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
  }

  const filteredMeals = filter === 'all' ? meals : meals.filter(m => m.category === filter)
  const isMe = currentUserId === profile?.id

  return (
    <div className="page-wrap">
      <div className="top-bar">
        <button onClick={() => router.push('/feed')} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer'
        }}>{EMOJI_BACK}</button>
        <div style={{ fontWeight: 800, fontSize: 16 }}>@{username}</div>
        <div style={{ width: 28 }} />
      </div>

      {profile && (
        <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <div className="avatar" style={{
            background: profile.avatar_color, width: 64, height: 64,
            fontSize: 32, margin: '0 auto 10px'
          }}>
            {profile.avatar_emoji}
          </div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>@{profile.username}</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, margin: '12px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{meals.length}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>meals</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{followerCount}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>followers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{followingCount}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>following</div>
            </div>
          </div>

          {!isMe && currentUserId && (
            <button onClick={handleFollow} disabled={followLoading} style={{
              padding: '10px 32px', borderRadius: 20, border: 'none',
              background: isFollowing ? 'var(--surface)' : 'var(--orange)',
              color: isFollowing ? 'var(--muted)' : 'white',
              fontWeight: 800, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              {followLoading ? '...' : isFollowing ? 'following' : 'follow'}
            </button>
          )}
        </div>
      )}

      <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>all meals</div>
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
        {!loading && !profile && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>user not found</p>
        )}
        {!loading && profile && filteredMeals.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>no {filter === 'all' ? 'meals' : filter} yet!</p>
        )}
        {filteredMeals.map(meal => (
          <MealCard key={meal.id} meal={meal} currentUserId={currentUserId} onReact={handleReact} onDelete={(id) => setMeals(meals.filter(m => m.id !== id))} />
        ))}
      </div>
    </div>
  )
}
