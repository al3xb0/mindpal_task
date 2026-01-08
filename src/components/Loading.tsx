export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg animate-pulse">
      <div className="w-full h-48 bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  )
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  )
}
