'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/lib/supabase/hooks'
import { useLock } from '@/lib/hooks'
import { LoginIcon, ErrorIcon, SpinnerIcon } from '@/components'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = useSupabase()
  const { isLocked, withLock } = useLock()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    await withLock(async () => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setError(error.message)
          return
        }

        router.push('/dashboard')
        router.refresh()
      } catch {
        setError('An unexpected error occurred')
      }
    })
  }

  return (
    <main className="auth-page">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="auth-card">
        <div className="text-center">
          <div className="auth-icon-wrapper">
            <LoginIcon className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="alert-error">
              <ErrorIcon className="h-5 w-5" />
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-base"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-base"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLocked}
            className="w-full btn-primary"
          >
            {isLocked ? (
              <span className="flex items-center justify-center gap-2">
                <SpinnerIcon className="h-5 w-5" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-green-400 hover:text-green-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
