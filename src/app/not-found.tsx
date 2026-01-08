import Link from 'next/link'
import { HomeIcon, HeartIcon } from '@/components/icons'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-green-400 via-green-500 to-cyan-400 animate-pulse opacity-30 blur-xl absolute inset-0" />
          <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-green-400 to-cyan-400 relative flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-gray-900 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center">
                <span className="text-6xl font-bold text-green-400">404</span>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Wubba Lubba Dub Dub!
        </h1>
        <p className="text-gray-400 mb-2 text-lg">
          Looks like you&apos;ve traveled to a dimension that doesn&apos;t exist.
        </p>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for couldn&apos;t be found.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
            Go to Dashboard
          </Link>
          <Link
            href="/favorites"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            <HeartIcon className="w-5 h-5" />
            View Favorites
          </Link>
        </div>

        <p className="mt-12 text-gray-600 text-sm">
          &quot;Nobody exists on purpose. Nobody belongs anywhere. Everybody&apos;s gonna die.&quot;
          <br />
          <span className="text-gray-500">— Morty Smith</span>
        </p>
      </div>
    </div>
  )
}
