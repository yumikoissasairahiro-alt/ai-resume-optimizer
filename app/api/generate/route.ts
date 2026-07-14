import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { jobDescription } = await request.json()

  if (!jobDescription || !jobDescription.trim()) {
    return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
  }

  const { data: resumeData } = await supabase
    .from('resumes')
    .select('content')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!resumeData?.content) {
    return NextResponse.json({ error: 'No resume found' }, { status: 400 })
  }

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
    return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer and career coach. Given a resume and a job description, produce (1) an optimized version of the resume tailored to the job description, and (2) a tailored cover letter. Respond ONLY in JSON with exactly two fields: optimizedResume and coverLetter. Both fields MUST be a single plain text string (like a plain .txt document with line breaks), NOT a nested object or array. Do not use nested keys inside optimizedResume or coverLetter. No extra commentary outside the JSON.'
        },
        {
          role: 'user',
          content: 'RESUME:\n' + resumeData.content + '\n\nJOB DESCRIPTION:\n' + jobDescription
        }
      ],
      response_format: { type: 'json_object' }
    })

    const raw = completion.choices[0].message.content
    const parsed = JSON.parse(raw || '{}')

    const toText = (value: unknown): string => {
      if (typeof value === 'string') return value
      if (value && typeof value === 'object') return JSON.stringify(value, null, 2)
      return ''
    }

    const optimizedResume = toText(parsed.optimizedResume)
    const coverLetter = toText(parsed.coverLetter)

    const { error: insertError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        job_description: jobDescription,
        optimized_resume: optimizedResume,
        cover_letter: coverLetter,
      })

    if (insertError) {
      return NextResponse.json({ error: 'Failed to save generation' }, { status: 500 })
    }

    return NextResponse.json({ optimizedResume, coverLetter })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
