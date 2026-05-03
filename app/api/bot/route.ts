import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BOT_USER_ID = '9c5dad3b-b305-4def-a20c-2671693476e9'

const MEALS = {
  breakfast: [
    { emoji: '🍳', name: 'classic eggs & toast', description: 'simple but never wrong' },
    { emoji: '🥞', name: 'fluffy pancakes', description: 'weekend energy on a weekday' },
    { emoji: '🍌', name: 'smoothie bowl', description: 'feeling healthy today' },
    { emoji: '🥐', name: 'butter croissant', description: 'a little treat' },
    { emoji: '🍵', name: 'matcha & rice cake', description: 'calm morning vibes' },
  ],
  lunch: [
    { emoji: '🍜', name: 'spicy ramen', description: 'slurp szn never ends' },
    { emoji: '🥗', name: 'caesar salad', description: 'trying to be good today' },
    { emoji: '🌮', name: 'street tacos', description: 'two is never enough' },
    { emoji: '🍱', name: 'bento box', description: 'balanced and cute' },
    { emoji: '🥙', name: 'falafel wrap', description: 'street food forever' },
  ],
  dinner: [
    { emoji: '🍕', name: 'pepperoni pizza', description: 'no notes' },
    { emoji: '🍣', name: 'salmon sashimi', description: 'treating myself tonight' },
    { emoji: '🥩', name: 'kbbq night', description: 'grill it yourself > everything' },
    { emoji: '🍝', name: 'spaghetti bolognese', description: 'comfort food szn' },
    { emoji: '🍛', name: 'chicken curry', description: 'spice level: send help' },
  ],
  snack: [
    { emoji: '🧋', name: 'brown sugar boba', description: 'its always boba time' },
    { emoji: '🍿', name: 'popcorn', description: 'movie snack at 3pm no shame' },
    { emoji: '🍩', name: 'glazed donut', description: 'little treat o\'clock' },
    { emoji: '🥜', name: 'trail mix', description: 'pretending to be healthy' },
    { emoji: '🍫', name: 'dark chocolate', description: 'it\'s basically a superfood' },
  ],
  drinks: [
    { emoji: '☕', name: 'iced americano', description: 'can\'t function without it' },
    { emoji: '🧃', name: 'fresh pressed juice', description: 'orange mango hits different' },
    { emoji: '🥤', name: 'strawberry lemonade', description: 'summer in a cup' },
    { emoji: '🍵', name: 'hojicha latte', description: 'cozy drink of the day' },
    { emoji: '💧', name: 'sparkling water', description: 'hydration nation' },
  ],
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const posts = []

  for (const [category, meals] of Object.entries(MEALS)) {
    const picked = pickRandom(meals, 3)
    for (const meal of picked) {
      posts.push({
        user_id: BOT_USER_ID,
        emoji: meal.emoji,
        name: meal.name,
        description: meal.description,
        category,
        photo_url: null,
      })
    }
  }

  const { error } = await supabase.from('meals').insert(posts)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, posted: posts.length })
}
