'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/lib/supabase/hooks'
import { useLock } from '@/lib/hooks'
import { VALIDATION } from '@/lib/constants'
import { PasswordStrength } from '@/components'
import { SignupIcon, ErrorIcon, CheckIcon, MailIcon, SpinnerIcon } from '@/components'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const supabase = useSupabase()
  const { isLocked, withLock } = useLock()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`)
      return
    }

    await withLock(async () => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        })

        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            setError('This email is already registered. Please try logging in instead.')
          } else {
            setError(error.message)
          }
          return
        }

        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError('This email is already registered. Please try logging in instead.')
          return
        }

        setSuccess(true)
        
        if (data.user && !data.session) {
          setEmailSent(true)
        }
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
            <SignupIcon className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Join Rick & Morty Favorites</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="alert-success text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-3">
                <CheckIcon className="h-6 w-6 text-green-400" />
              </div>
              <p className="font-medium">Account created successfully!</p>
              
              {emailSent ? (
                <div className="mt-3 text-sm text-gray-300">
                  <p>We&apos;ve sent a confirmation email to:</p>
                  <p className="font-medium text-white mt-1">{email}</p>
                  <p className="mt-3 text-gray-400">
                    Please check your inbox and click the confirmation link to activate your account.
                  </p>
                </div>
              ) : (
                <p className="text-sm mt-1 text-gray-300">Redirecting to dashboard...</p>
              )}
            </div>
            
            {emailSent && (
              <div className="alert-info">
                <div className="flex items-start gap-3">
                  <MailIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-blue-400">Didn&apos;t receive the email?</p>
                    <ul className="mt-2 space-y-1 text-gray-400">
                      <li>• Check your spam folder</li>
                      <li>• Make sure the email address is correct</li>
                      <li>• Wait a few minutes and try again</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <Link
              href="/login"
              className="block w-full py-3 text-center btn-secondary"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
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
              <PasswordStrength password={password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`input-base ${
                  confirmPassword && password !== confirmPassword 
                    ? '!border-red-500' 
                    : confirmPassword && password === confirmPassword 
                    ? '!border-green-500' 
                    : ''
                }`}
                placeholder="••••••••"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-400">Passwords don&apos;t match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLocked}
              className="w-full btn-primary"
            >
              {isLocked ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerIcon className="h-5 w-5" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        )}

        <p className="text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-green-400 hover:text-green-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
