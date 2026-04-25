'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

const AVATAR_COLORS = ['#FFE8D6','#D6F0FF','#FFD6F0','#D6FFE8','#FAFFD6','#F0D6FF']
const AVATAR_EMOJIS = ['🌟','🎯','🎨','🦊','🎸','🌈','🍀','🦋','🌸','⚡','🎭','🔥']

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function cleanUsername(val: string) {
    return val.replace('@','').trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
  }

  async function handleLogin() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/feed')
  }

  async function handleSignup() {
    setLoading(true); setError('')
    const cleanedUsername = cleanUsername(username)
    if (!cleanedUsername) { setError('pick a username! only letters, numbers, underscores'); setLoading(false); return }
    if (cleanedUsername.length < 3) { setError('username must be at least 3 characters'); setLoading(false); return }
    if (!email.trim()) { setError('enter your email!'); setLoading(false); return }
    if (password.length < 6) { setError('password must be at least 6 characters'); setLoading(false); return }

    // check if username is taken
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', cleanedUsername).maybeSingle()
    if (existing) { setError('that username is taken 😅 try another!'); setLoading(false); return }

    const randomEmoji = AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)]
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username: cleanedUsername } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: cleanedUsername,
        avatar_emoji: randomEmoji,
        avatar_color: randomColor,
      })
      router.push('/feed')
    }
    setLoading(false)
  }

  return (
    <div className="page-wrap" style={{ alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '52px', marginBottom: '8px' }}>🍽️</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: '22px', color: 'var(--orange)', marginBottom: '6px' }}>
          whatchueattoday
        </div>
        <div style={{ fontSize: '15px', color: 'var(--muted)' }}>
          see what everyone's eating & get inspired ✨
        </div>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '380px', border: '1.5px solid var(--border)' }}>
        <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '14px', padding: '4px', marginBottom: '24px' }}>
          {(['login','signup'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '8px', borderRadius: '10px', border: 'none',
              background: tab === t ? 'white' : 'transparent',
              fontWeight: 700, fontSize: '14px', color: tab === t ? 'var(--text)' : 'var(--muted)',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}>{t === 'login' ? 'log in' : 'sign up'}</button>
          ))}
        </div>

        {tab === 'signup' && (
          <div className="input-group">
            <label className="input-label">username</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontWeight: 700, fontSize: 15 }}>@</span>
              <input className="text-input" type="text" placeholder="yourname"
                style={{ paddingLeft: 28 }}
                value={username} onChange={e => setUsername(e.target.value.replace('@',''))}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" />
            </div>
            {username && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>@{cleanUsername(username)}</p>}
          </div>
        )}

        <div className="input-group">
          <label className="input-label">email</label>
          <input className="text-input" type="email" placeholder="you@email.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="input-group">
          <label className="input-label">password</label>
          <input className="text-input" type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleSignup())} />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn-primary" disabled={loading}
          onClick={tab === 'login' ? handleLogin : handleSignup}>
          {loading ? '...' : tab === 'login' ? "let's eat 🍴" : 'create account 🎉'}
        </button>
      </div>
    </div>
  )
}
