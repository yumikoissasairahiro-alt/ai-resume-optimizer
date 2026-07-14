'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResumePage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const loadResume = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('resumes')
        .select('content')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setContent(data.content)
      }
      setLoading(false)
    }

    loadResume()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('resumes')
      .upsert(
        { user_id: user.id, content: content },
        { onConflict: 'user_id' }
      )

    if (error) {
      setMessage('Something went wrong while saving.')
    } else {
      setMessage('Saved successfully.')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">Your Resume</h1>
        <p className="text-gray-500 text-sm mb-6">
          Paste your resume text below and save it.
        </p>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          placeholder="Paste your resume text here..."
          className="w-full border border-gray-300 rounded-md p-4 text-sm font-mono mb-4"
        />

        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className="w-full bg-black text-white rounded-md py-2 px-4 hover:bg-gray-800 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>

        {message && (
          <p className="text-sm text-center mt-4 text-gray-600">{message}</p>
        )}
      </div>
    </div>
  )
}
