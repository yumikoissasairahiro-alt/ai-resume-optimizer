'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage('Something went wrong. Please try again.')
    } else {
      setMessage('Check your inbox for a login link.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-sm w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>

        <button
          onClick={handleGoogleLogin}
          className="w-full border border-gray-300 rounded-md py-2 px-4 mb-4 hover:bg-gray-50 transition"
        >
          Continue with Google
        </button>

        <div className="text-center text-gray-400 text-sm mb-4">or</div>

        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-4 mb-3"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-md py-2 px-4 hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Continue with Email'}
          </button>
        </form>

        {message && (
          <p className="text-sm text-center mt-4 text-gray-600">{message}</p>
        )}
      </div>
    </div>
  )
}
