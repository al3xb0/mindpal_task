'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/lib/supabase/hooks'
import { SpinnerIcon, LogoutIcon } from '@/components'

interface NavbarProps {
  userEmail?: string
}

export function Navbar({ userEmail }: NavbarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = useSupabase()

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      }
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
      router.push('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const navLinks = [
    { href: '/dashboard', label: 'Characters' },
    { href: '/favorites', label: 'Favorites' },
  ]

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-green-400">
              Rick & Morty
            </Link>
            <div className="flex gap-1">
              {navLinks.map(link => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'}
                    `}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-gray-400 text-sm hidden sm:inline">{userEmail}</span>
            )}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isLoggingOut ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogoutIcon className="h-4 w-4" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
