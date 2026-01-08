'use client'

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0
    
    if (pwd.length >= 6) score++
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }

  const { score, label, color } = getStrength(password)
  const percentage = Math.min((score / 6) * 100, 100)

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">Password strength</span>
        <span className={`text-xs font-medium ${
          label === 'Weak' ? 'text-red-400' : 
          label === 'Medium' ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {label}
        </span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <ul className="mt-2 space-y-1 text-xs text-gray-500">
        <li className={password.length >= 8 ? 'text-green-400' : ''}>
          {password.length >= 8 ? '✓' : '○'} At least 8 characters
        </li>
        <li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-400' : ''}>
          {/[A-Z]/.test(password) && /[a-z]/.test(password) ? '✓' : '○'} Upper & lowercase letters
        </li>
        <li className={/\d/.test(password) ? 'text-green-400' : ''}>
          {/\d/.test(password) ? '✓' : '○'} At least one number
        </li>
        <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-400' : ''}>
          {/[^a-zA-Z0-9]/.test(password) ? '✓' : '○'} Special character (!@#$...)
        </li>
      </ul>
    </div>
  )
}
