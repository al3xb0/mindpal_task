import { ImageResponse } from 'next/og'

export const alt = 'Rick & Morty Favorites'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1f2937 60%, #0f172a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 100, fontWeight: 800, color: '#4ade80', letterSpacing: -2 }}>
          Rick &amp; Morty
        </div>
        <div style={{ display: 'flex', fontSize: 52, fontWeight: 600, color: '#e5e7eb', marginTop: 8 }}>
          Favorites Dashboard
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#9ca3af', marginTop: 28 }}>
          Explore characters and save your favorites
        </div>
      </div>
    ),
    { ...size },
  )
}
