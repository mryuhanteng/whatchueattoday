'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import AddMealModal from '@/components/AddMealModal'
import MealCard from '@/components/MealCard'

export type Profile = { id: string; username: string; avatar_emoji: string; avatar_color: string }
export type Meal = {
  id: string; user_id: string; emoji: string; name: string; description: string;
  photo_url: string | null;
  created_at: string; profiles: Profile;
  reactions: { emoji: string; count: number; user_reacted: boolean }[]
}

export default function FeedPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [me, setMe] = useState<Profile | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
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
      for (const e of ['😍','🔥','😂']) {
        if (!reactions.find(r => r.emoji === e)) reactions.push({ emoji: e, count: 0, user_reacted: false })
      }
      return { ...meal, reactions }