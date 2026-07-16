'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function GeneratePage() {
  const [hasResume, setHasResume] = useState(false)
  const [resumeContent, setResumeContent] = useState('')
  const [editingResume, setEditingResume] = useState(false)
  const [resumeDraft, setResumeDraft] = useState('')
  const [savingResume, setSavingResume] = useState(false)
  const [resumeSavedMsg, setResumeSavedMsg] = useState('')

  const [needsUpgrade, setNeedsUpgrade] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')
  const [optimizedResume, setOptimizedResume] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [copiedResume, setCopiedResume] = useState(false)
  const [copiedLetter, setCopiedLetter] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: resumeData } = await supabase
        .from('resumes')
        .select('content')
        .eq('user_id', user.id)
        .maybeSingle()

      setHasResume(!!resumeData?.content)
      setResumeContent(resumeData?.content || '')

      const { count } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      const isPaid = !!subscription
      const usedFreeGeneration = (count ?? 0) >= 1

      if (usedFreeGeneration && !isPaid) {
        setNeedsUpgrade(true)
      }

      setLoading(false)
    }

    checkAccess()
  }, [router])

  const startEditingResume = () => {
    setResumeDraft(resumeContent)
    setEditingResume(true)
    setResumeSavedMsg('')
  }

  const cancelEditingResume = () => {
    setEditingResume(false)
    setResumeDraft('')
  }

  const saveResume = async () => {
    if (!resumeDraft.trim()) return
    setSavingResume(true)
    setResumeSavedMsg('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('resumes')
        .upsert(
          { user_id: user.id, content: resumeDraft },
          { onConflict: 'user_id' }
        )

      if (error) {
        setResumeSavedMsg('Failed to save. Please try again')
      } else {
        setResumeContent(resumeDraft)
        setHasResume(true)
        setEditingResume(false)
        setResumeSavedMsg('Resume updated')
        setTimeout(() => setResumeSavedMsg(''), 3000)
      }
    } catch (err) {
      setResumeSavedMsg('Failed to save. Please try again.')
    }

    setSavingResume(false)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setMessage('')
    setOptimizedResume('')
    setCoverLetter('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      })

      const data = await res.json()

      if (res.status === 403) {
        setNeedsUpgrade(true)
      } else if (!res.ok) {
        setMessage(data.error || 'Something went wrong.')
      } else {
        setOptimizedResume(data.optimizedResume)
        setCoverLetter(data.coverLetter)
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.')
    }

    setGenerating(false)
  }

  const copyToClipboard = async (text: string, which: 'resume' | 'letter') => {
    await navigator.clipboard.writeText(text)
    if (which === 'resume') {
      setCopiedResume(true)
      setTimeout(() => setCopiedResume(false), 2000)
    } else {
      setCopiedLetter(true)
      setTimeout(() => setCopiedLetter(false), 2000)
    }
  }

  const downloadAsFile = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!hasResume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-sm w-full bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-6">
            Please save your resume first before generating.
          </p>
          <Link
            href="/resume"
            className="block w-full bg-black text-white rounded-md py-2 px-4 hover:bg-gray-800 transition"
          >
            Go to My Resume
          </Link>
        </div>
      </div>
    )
  }

  if (needsUpgrade) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-sm w-full bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-800 font-semibold mb-2">
            You have used your free generation.
          </p>
          <p className="text-gray-600 mb-6">
            Upgrade to keep generating optimized resumes and cover letters.
          </p>
          <Link
            href={process.env.NEXT_PUBLIC_STRIPE_STANDARD_LINK || '#'}
            className="block w-full bg-black text-white rounded-md py-2 px-4 hover:bg-gray-800 transition mb-3"
          >
            Upgrade - $19/month
          </Link>
          <Link
            href={process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_LINK || '#'}
            className="block w-full border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition"
          >
            Upgrade - $39/month (Unlimited)
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">Generate Optimized Resume</h1>
        <p className="text-gray-500 text-sm mb-6">
          Paste the job description below, then click Generate.
        </p>

        {/* Resume status / replace section */}
        <div className="mb-6 border border-gray-200 rounded-md p-4 bg-gray-50">
          {!editingResume ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">✓ Resume saved</span>
              <button
                onClick={startEditingResume}
                className="text-xs border border-gray-300 rounded-md px-3 py-1 hover:bg-white transition bg-white"
              >
                Replace Resume
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Paste your new resume content below to replace the current one.
              </p>
              <textarea
                value={resumeDraft}
                onChange={(e) => setResumeDraft(e.target.value)}
                rows={10}
                className="w-full border border-gray-300 rounded-md p-3 text-sm font-mono mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveResume}
                  disabled={savingResume || !resumeDraft.trim()}
                  className="bg-black text-white rounded-md px-4 py-1.5 text-sm hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {savingResume ? 'Saving...' : 'Save Resume'}
                </button>
                <button
                  onClick={cancelEditingResume}
                  disabled={savingResume}
                  className="border border-gray-300 rounded-md px-4 py-1.5 text-sm hover:bg-white transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {resumeSavedMsg && (
            <p className="text-xs text-green-700 mt-2">{resumeSavedMsg}</p>
          )}
        </div>

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={12}
          placeholder="Paste the job description here..."
          className="w-full border border-gray-300 rounded-md p-4 text-sm font-mono mb-4"
        />

        <button
          onClick={handleGenerate}
          disabled={generating || !jobDescription.trim()}
          className="w-full bg-black text-white rounded-md py-2 px-4 hover:bg-gray-800 transition disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate'}
        </button>

        {message && (
          <p className="text-sm text-center mt-4 text-red-600">{message}</p>
        )}

        {optimizedResume && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold">Optimized Resume</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(optimizedResume, 'resume')}
                  className="text-xs border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50 transition"
                >
                  {copiedResume ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => downloadAsFile(optimizedResume, 'optimized-resume.txt')}
                  className="text-xs border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50 transition"
                >
                  Download
                </button>
              </div>
            </div>
            <textarea
              value={optimizedResume}
              onChange={(e) => setOptimizedResume(e.target.value)}
              rows={16}
              className="w-full whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md border border-gray-200 font-mono"
            />
          </div>
        )}

        {coverLetter && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold">Cover Letter</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(coverLetter, 'letter')}
                  className="text-xs border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50 transition"
                >
                  {copiedLetter ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => downloadAsFile(coverLetter, 'cover-letter.txt')}
                  className="text-xs border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50 transition"
                >
                  Download
                </button>
              </div>
            </div>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={12}
              className="w-full whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md border border-gray-200 font-mono"
            />
          </div>
        )}
      </div>
    </div>
  )
}