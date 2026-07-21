import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/generate')
  }

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Turn one resume into a perfect match for every job description
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Paste your resume and a job posting. Our AI rewrites your bullet
          points to highlight exactly what that job is looking for — in seconds.
        </p>
        <Link
          href="/login"
          className="inline-block bg-black text-white rounded-md py-3 px-8 hover:bg-gray-800 transition font-medium"
        >
          Try it free
        </Link>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-center mb-10">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl mb-3">1️⃣</div>
            <p className="font-medium mb-1">Paste your resume</p>
            <p className="text-sm text-gray-500">Upload or paste your current resume text.</p>
          </div>
          <div>
            <div className="text-3xl mb-3">2️⃣</div>
            <p className="font-medium mb-1">Paste the job posting</p>
            <p className="text-sm text-gray-500">Add the job description you're applying to.</p>
          </div>
          <div>
            <div className="text-3xl mb-3">3️⃣</div>
            <p className="font-medium mb-1">Get your tailored resume</p>
            <p className="text-sm text-gray-500">AI rewrites your resume to match — ready to copy.</p>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 pb-16 grid sm:grid-cols-2 gap-6">
        <img src="/1screenshot-login.png" alt="Login screen" className="rounded-lg shadow-lg border" />
        <img src="/2screenshot-resume.png" alt="Resume saved screen" className="rounded-lg shadow-lg border" />
        <img src="/3screenshot-generate.png" alt="Generate screen" className="rounded-lg shadow-lg border" />
        <img src="/4screenshot-result.png" alt="AI-generated tailored resume result" className="rounded-lg shadow-lg border" />
      </div>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-center mb-10">Simple pricing</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6 text-center">
            <p className="font-semibold text-lg mb-1">Job Search Pack</p>
            <p className="text-3xl font-bold mb-2">$19</p>
            <p className="text-sm text-gray-500 mb-4">One-time purchase, use anytime</p>
            <p className="text-xs text-gray-400">Full refund within 7 days if unused</p>
          </div>
          <div className="bg-white border rounded-lg p-6 text-center">
            <p className="font-semibold text-lg mb-1">Monthly Unlimited</p>
            <p className="text-3xl font-bold mb-2">$15<span className="text-base font-normal">/mo</span></p>
            <p className="text-sm text-gray-500 mb-4">Unlimited resume optimizations</p>
            <p className="text-xs text-gray-400">First month refundable within 7 days</p>
          </div>
        </div>
        <div className="text-center mt-10">
          <Link
            href="/login"
            className="inline-block bg-black text-white rounded-md py-3 px-8 hover:bg-gray-800 transition font-medium"
          >
            Get started
          </Link>
        </div>
      </section>
    </div>
  )
}
