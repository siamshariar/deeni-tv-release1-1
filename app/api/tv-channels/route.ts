import { NextResponse } from 'next/server'

// Live server API — direct call
const TV_CHANNELS_API =
  process.env.NEXT_PUBLIC_TV_CHANNELS_API || 'https://api.deeniinfotech.com/api/tv-channels'

// Fallback data: exact same format as the live API response.
// Used when the live API is unreachable (e.g. Cloudflare block on STG/local).
const FALLBACK_DATA = [
  { id: 1, title: 'Bangla', localizationId: '5', isQuran: null },
  { id: 2, title: 'Quran - Bangla', localizationId: '5', isQuran: true },
  { id: 3, title: 'English', localizationId: '6', isQuran: null },
  { id: 4, title: 'Quran - English', localizationId: '6', isQuran: true },
  { id: 5, title: 'Arabic', localizationId: '7', isQuran: null },
  { id: 6, title: 'Quran - Arabic', localizationId: '7', isQuran: true },
  { id: 7, title: 'Urdu', localizationId: '8', isQuran: null },
  { id: 8, title: 'Chinese', localizationId: '9', isQuran: null },
  { id: 9, title: 'Quran - Chinese', localizationId: '9', isQuran: true },
]

export async function GET() {
  try {
    const res = await fetch(TV_CHANNELS_API, { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      return NextResponse.json(json)
    }
  } catch {
    // Live API unavailable — fall through to static fallback
  }
  return NextResponse.json({ data: FALLBACK_DATA })
}
