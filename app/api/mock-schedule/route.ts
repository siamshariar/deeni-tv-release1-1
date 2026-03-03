import { NextResponse } from 'next/server'

/**
 * Static Mock Schedule API
 *
 * Returns the exact same JSON structure as the real DinInfo API.
 * Program list is exact data from the provided real API response.
 * seekTo is calculated live so the video always starts at the correct position.
 *
 * Loops the same playlist continuously — never expires.
 * Replace with a real external fetch once the server IP is whitelisted.
 */

const PROGRAMS = [
  { ytVideoId: 'hABN2uy36v8', title: 'হিজরতের বিবেক জাগানিয়া শিক্ষা: ঈমান প্রশ্নে আপস নয়', duration: 1800 },
  { ytVideoId: 'NTtDNHKr-zk', title: 'বর্তমান আলেম সমাজের অবস্থা আমাদের করণীয়- ড. খোন্দকার আব্দুল্লাহ জাহাঙ্গীর রাহিমাহুল্লাহ', duration: 1043 },
  { ytVideoId: 'mT5HfBlIbKM', title: '20.3 সূরা ত্ব-হা ২য় পর্ব (অংশ - ১/৩) ।। Dr. Imam Hossain', duration: 1233 },
  { ytVideoId: '2C8rGnSyeVA', title: 'জেনে নিন ড. খোন্দকার আব্দুল্লাহ জাহঙ্গীর রাহ. ইসলামিক টিভির প্রোগ্রাম দৈনন্দিন জীবনে ইসলাম', duration: 1911 },
  { ytVideoId: 'EBmlXo-lgcU', title: 'আপনার জিজ্ঞাসা ২০২৪ | Apnar Jiggasa | EP 3206 | NTV Islamic Show', duration: 1362 },
  { ytVideoId: 'wlTnG3PvBG8', title: 'জুমুআর খুতবাহ্\u200c - আল্লাহ কোথায় ? ।। Dr. Imam Hossain', duration: 3633 },
  { ytVideoId: 't0Xici9CVZo', title: '১০. কিতাবুল আদাব। শাইখ শাহীদুল্লাহ খান মাদানী। পিস টিভি বাংলা', duration: 1800 },
  { ytVideoId: 'XTs0pbt0RBw', title: '৪.৪ জন্মনিয়ন্ত্রণ ও তার অশুভ পরিণাম। জ্ঞানগর্ভ আলোচনার মঞ্চ। গ্রুপ আলোচনা। পিস টিভি বাংলা', duration: 1799 },
  { ytVideoId: 's3B-9ZHhNdM', title: 'করোনা পরিস্থিতিতে আকিদা বিশুদ্ধ রাখতে ৫টি বিষয় মাথায় রাখুন', duration: 1019 },
  { ytVideoId: 'x04S5VXWL9Q', title: "নির্বাচিত প্রশ্নোত্তর 'শরয়ী সমাধান'। পর্ব-২৮৫", duration: 4022 },
  { ytVideoId: 'pOo8X-GQNV8', title: 'Live:Tafseerul Quran Surah # 17, AL-ISRA Part-3(Ayat:31-55)', duration: 5923 },
  { ytVideoId: 'alRKQczhJpM', title: 'লাইভ : সীরাতে রহমাতুল্লিল আলামিন - ধারাবাহিক আলোচনা - পর্ব -৩ ।', duration: 4144 },
  { ytVideoId: 'muYIj4KAIy8', title: 'রমাদান বিষয়ক প্রশ্নোত্তরের ধারাবাহিক অনুষ্ঠান  (পর্ব-১০)', duration: 2191 },
  { ytVideoId: 'OxoIOfeTB80', title: 'Ilm O Amal ।। Dr. Imam Hossain', duration: 4581 },
  { ytVideoId: 'UCn1v4ME2tc', title: "জুম'আর খুতবাহ্ : জিল-হজ্জ মাসের প্রথম দশ দিনের করনীয় আমল সমূহ", duration: 3655 },
  { ytVideoId: 'FZ8Zy4IW6MA', title: 'আল কুরআনের আলো । পর্ব ৩০১। শাইখ মতিউর রহমান মাদানী । পিস টিভি বাংলা', duration: 1316 },
]

const CYCLE_SECONDS = PROGRAMS.reduce((sum, p) => sum + p.duration, 0)

// Anchor: 2026-03-03 00:00:00 UTC — playlist loops deterministically from here
const EPOCH_ANCHOR_MS = Date.UTC(2026, 2, 3, 0, 0, 0)

export async function GET() {
  const now = Date.now()

  // Seconds elapsed into the current cycle
  const elapsed = Math.floor((now - EPOCH_ANCHOR_MS) / 1000)
  const pos = ((elapsed % CYCLE_SECONDS) + CYCLE_SECONDS) % CYCLE_SECONDS

  // Build offset table: offsets[i] = cycle-seconds at which program i starts
  const offsets: number[] = []
  let acc = 0
  for (const p of PROGRAMS) {
    offsets.push(acc)
    acc += p.duration
  }

  // Which program is playing right now?
  let idx = PROGRAMS.length - 1
  for (let i = 0; i < PROGRAMS.length; i++) {
    if (pos >= offsets[i] && pos < offsets[i] + PROGRAMS[i].duration) {
      idx = i
      break
    }
  }

  const cycleStartMs = now - pos * 1000
  const absStart = (i: number) => cycleStartMs + offsets[i] * 1000
  const absEnd   = (i: number) => absStart(i) + PROGRAMS[i].duration * 1000
  const seekTo   = pos - offsets[idx]

  // currentProgram
  const currentProgram = {
    ytVideoId: PROGRAMS[idx].ytVideoId,
    title:     PROGRAMS[idx].title,
    startTime: absStart(idx),
    endTime:   absEnd(idx),
    duration:  PROGRAMS[idx].duration,
    seekTo,
  }

  // previousPrograms — 5 items, most-recent first
  const previousPrograms: Array<{
    ytVideoId: string; title: string; startTime: number; endTime: number; duration: number
  }> = []
  for (let i = 1; i <= 5; i++) {
    const pi = ((idx - i) % PROGRAMS.length + PROGRAMS.length) % PROGRAMS.length
    let prevEnd = currentProgram.startTime
    for (let j = 1; j < i; j++) {
      const pj = ((idx - j) % PROGRAMS.length + PROGRAMS.length) % PROGRAMS.length
      prevEnd -= PROGRAMS[pj].duration * 1000
    }
    previousPrograms.push({
      ytVideoId: PROGRAMS[pi].ytVideoId,
      title:     PROGRAMS[pi].title,
      startTime: prevEnd - PROGRAMS[pi].duration * 1000,
      endTime:   prevEnd,
      duration:  PROGRAMS[pi].duration,
    })
  }

  // upcomingPrograms — 10 items
  const upcomingPrograms: Array<{
    ytVideoId: string; title: string; startTime: number; endTime: number; duration: number
  }> = []
  let nextStart = currentProgram.endTime
  for (let i = 1; i <= 10; i++) {
    const ui = (idx + i) % PROGRAMS.length
    upcomingPrograms.push({
      ytVideoId: PROGRAMS[ui].ytVideoId,
      title:     PROGRAMS[ui].title,
      startTime: nextStart,
      endTime:   nextStart + PROGRAMS[ui].duration * 1000,
      duration:  PROGRAMS[ui].duration,
    })
    nextStart += PROGRAMS[ui].duration * 1000
  }

  return NextResponse.json(
    { serverTime: now, currentProgram, previousPrograms, upcomingPrograms, _source: 'mock-schedule' },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' } }
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
