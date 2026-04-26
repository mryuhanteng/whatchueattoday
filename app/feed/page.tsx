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
      .select('*, profiles
