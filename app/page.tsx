import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-sm w-full bg-white p-8 rounded-lg shadow text-center">
        {user ? (
          <div>
            <p className="text-gray-600 mb-2">Logged in as:</p>
            <p className="font-semibold mb-6">{user.email}</p>
            <Link
              href="/resume"
              className="block w-full bg-black text-white rounded-md py-2 px-4 hover:bg-gray-800 transition mb-3"
            >
              Go to My Resume
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition"
              >
                Log Out
              </button>
            </form>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-6">You are not logged in</p>
            <Link
              href="/login"
              className="block w-full bg-black text-white rounded-md py-2 px-4 hover:bg-gray-800 transition"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
