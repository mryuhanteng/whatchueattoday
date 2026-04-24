'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/feed')
  }

  async function handleSignup() {
    setLoading(true); setError('')
    if (!username.trim()) { setError('pick a username!'); setLoading(false); return }
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username: username.replace('@','').trim().toLowerCase() } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: username.replace('@','').trim().toLowerCase(),
        avatar_emoji: '🌟',
        avatar_color: '#FFE8D6',
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
            <label className="input-label">pick a username</label>
            <input className="text-input" type="text" placeholder="@foodie2024"
              value={username} onChange={e => setUsername(e.target.value)} />
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
