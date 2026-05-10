'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_emoji: string
    avatar_color: string
  }
}

interface Meal {
  id: string
  emoji: string
  name: string
  description: string
  photo_url: string | null
  category: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_emoji: string
    avatar_color: string
  }
}

interface Props {
  meal: Meal
  currentUserId: string | null
  onClose: () => void
}

export default function MealDetailModal({ meal, currentUserId, onClose }: Props) {
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchComments()
  }, [meal.id])

  async function fetchComments() {
    setLoading(true)
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_emoji, avatar_color)')
      .eq('meal_id', meal.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
    setLoading(false)
  }

  async function submitComment() {
    if (!newComment.trim() || !currentUserId || submitting) return
    setSubmitting(true)

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        meal_id: meal.id,
        user_id: currentUserId,
        content: newComment.trim(),
      })
      .select('*, profiles(username, avatar_emoji, avatar_color)')
      .single()

    if (!error && comment) {
      setComments(prev => [...prev, comment])
      setNewComment('')
      if (meal.user_id !== currentUserId) {
        await supabase.from('notifications').insert({
          user_id: meal.user_id,
          from_user_id: currentUserId,
          meal_id: meal.id,
          comment_id: comment.id,
          type: 'comment',
          emoji: '💬',
          read: false,
        })
      }
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
    setSubmitting(false)
  }

  async function deleteComment(commentId: string) {
    await supabase.from('comments').delete().eq('id', commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  function formatTime(ts: string) {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <>
      {/* backdrop — tapping closes */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.4)',
        }}
      />

      {/* sheet — fixed height, never full screen */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 1000,
        height: '75vh',
        background: '#FFF8F3',
        borderRadius: '20px 20px 0 0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#ddd' }} />
        </div>

        {/* meal header */}
        <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid #F0E8E0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: meal.profiles.avatar_color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, flexShrink: 0,
            }}>
              {meal.profiles.avatar_emoji}
            </div>
            <div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
                @{meal.profiles.username}
              </div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#aaa' }}>
                {formatTime(meal.created_at)}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                fontSize: 20, cursor: 'pointer', color: '#bbb', lineHeight: 1, padding: 0,
              }}
            >✕</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>{meal.emoji}</span>
            <div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
                {meal.name}
              </div>
              {meal.description && (
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#666' }}>
                  {meal.description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* comments list — scrollable middle */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24, fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#aaa' }}>
              loading...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#aaa' }}>
                no comments yet. be the first!
              </div>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: comment.profiles.avatar_color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15,
                }}>
                  {comment.profiles.avatar_emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: '#E85D04' }}>
                      @{comment.profiles.username}
                    </span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#ccc' }}>
                      {formatTime(comment.created_at)}
                    </span>
                    {currentUserId === comment.user_id && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 11, color: '#ddd', cursor: 'pointer' }}
                      >
                        delete
                      </button>
                    )}
                  </div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#333', marginTop: 2, lineHeight: 1.5 }}>
                    {comment.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* input — pinned to bottom of sheet */}
        <div style={{
          padding: '10px 16px 32px',
          borderTop: '1px solid #F0E8E0',
          background: '#FFF8F3',
          display: 'flex', gap: 8, alignItems: 'center',
          flexShrink: 0,
        }}>
          {currentUserId ? (
            <>
              <input
                ref={inputRef}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
                placeholder="add a comment..."
                maxLength={300}
                style={{
                  flex: 1,
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 13,
                  padding: '10px 14px',
                  borderRadius: 20,
                  border: '1.5px solid #E0D8D0',
                  background: '#fff',
                  outline: 'none',
                  color: '#1a1a1a',
                }}
              />
              <button
                onClick={submitComment}
                disabled={!newComment.trim() || submitting}
                style={{
                  background: newComment.trim() ? '#E85D04' : '#ddd',
                  border: 'none', borderRadius: '50%',
                  width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: newComment.trim() ? 'pointer' : 'default',
                  fontSize: 16, flexShrink: 0,
                  transition: 'background 0.15s',
                }}
              >
                {submitting ? '⏳' : '➤'}
              </button>
            </>
          ) : (
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#aaa', textAlign: 'center', width: '100%' }}>
              sign in to comment
            </div>
          )}
        </div>
      </div>
    </>
  )
}
