import { NextResponse } from 'next/server'

export async function GET() {
  const data = [
    {
      id: 1,
      title: 'Bangla',
      localizationId: '5',
      isQuran: null,
    },
    {
      id: 2,
      title: 'Quran - Bangla',
      localizationId: '5',
      isQuran: true,
    },
    {
      id: 3,
      title: 'English',
      localizationId: '6',
      isQuran: null,
    },
    {
      id: 4,
      title: 'Quran - English',
      localizationId: '6',
      isQuran: true,
    },
    {
      id: 5,
      title: 'Arabic',
      localizationId: '7',
      isQuran: null,
    },
    {
      id: 6,
      title: 'Quran - Arabic',
      localizationId: '7',
      isQuran: true,
    },
    {
      id: 7,
      title: 'Urdu',
      localizationId: '8',
      isQuran: null,
    },
    {
      id: 8,
      title: 'Chinese',
      localizationId: '9',
      isQuran: null,
    },
    {
      id: 9,
      title: 'Quran - Chinese',
      localizationId: '9',
      isQuran: true,
    },
  ]

  return NextResponse.json({ data })
}
