import { NextResponse } from 'next/server'
import { getCurrentProgram, getUpcomingPrograms, getChannelPrograms, CHANNELS, MASTER_EPOCH_START, CHANNEL_LID_MAP, isQuranChannel } from '@/lib/schedule-utils'

const EXTERNAL_API_BASE = 'https://api.deeniinfotech.com/api/tv-schedules'

// Fetch from the local mock schedule (replaces Cloudflare-blocked external API)
async function fetchMockSchedule(): Promise<any | null> {
  try {
    // Same-server fetch: works without Cloudflare issues
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4356'
    const response = await fetch(`${base}/api/mock-schedule`, {
      cache: 'no-store',
    })
    if (!response.ok) return null
    const data = await response.json()
    console.log('✅ Mock schedule loaded, source:', data._source)
    return data
  } catch (error) {
    console.error('❌ Mock schedule fetch failed:', error)
    return null
  }
}

async function fetchExternalAPI(channelId: string): Promise<any | null> {
  try {
    const lid = CHANNEL_LID_MAP[channelId] || 5
    let apiUrl = `${EXTERNAL_API_BASE}/live?lid=${lid}`
    
    if (isQuranChannel(channelId)) {
      apiUrl += '&IS=true'
    }
    
    const apiKey = process.env.NP_AS_L
    if (!apiKey) {
      console.warn('⚠️ NP_AS_L env not set, using local schedule data')
      return null
    }
    
    console.log(`📡 Fetching external API: ${apiUrl}`)
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
        'NP_AS_L': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Origin': 'https://dini.tv',
        'Referer': 'https://dini.tv/',
        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const text = await response.text()
      console.error(`❌ External API returned ${response.status}: ${text.substring(0, 200)}`)
      return null
    }
    
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const text = await response.text()
      console.error(`❌ External API returned non-JSON: ${text.substring(0, 200)}`)
      return null
    }
    
    const data = await response.json()
    console.log('✅ External API response:', JSON.stringify(data).substring(0, 300))
    return data
  } catch (error) {
    console.error('❌ External API fetch failed:', error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channel') || CHANNELS[0].id
    
    const serverTime = Date.now()
    
    // 1️⃣ Try real external API (blocked by Cloudflare until IP-whitelist is done)
    const externalData = await fetchExternalAPI(channelId)

    // 2️⃣ Fall back to mock schedule (same server, no Cloudflare)
    const scheduleData = externalData || (channelId === 'bangla-1' ? await fetchMockSchedule() : null)
    
    if (scheduleData) {
      // Parse the schedule response (works for both real external API and mock)
      let currentProgram = null
      let previousPrograms: any[] = []
      let upcomingPrograms: any[] = []
      
      const curr = scheduleData.currentProgram || scheduleData.current || scheduleData.data?.currentProgram
      if (curr) {
        currentProgram = {
          ytVideoId: curr.ytVideoId || curr.videoId || curr.yt_video_id,
          title: curr.title || curr.name,
          startTime: curr.startTime || curr.start_time || serverTime,
          endTime: curr.endTime || curr.end_time || (serverTime + (curr.duration || 3600) * 1000),
          duration: curr.duration || 3600,
          seekTo: curr.seekTo || curr.seek_to || 0,
        }
      }
      
      const prevList = scheduleData.previousPrograms || scheduleData.previous || scheduleData.data?.previousPrograms || []
      previousPrograms = (Array.isArray(prevList) ? prevList : []).map((prog: any) => ({
        ytVideoId: prog.ytVideoId || prog.videoId || prog.yt_video_id,
        title: prog.title || prog.name,
        startTime: prog.startTime || prog.start_time,
        endTime: prog.endTime || prog.end_time,
        duration: prog.duration,
      }))
      
      const upList = scheduleData.upcomingPrograms || scheduleData.upcoming || scheduleData.data?.upcomingPrograms || []
      upcomingPrograms = (Array.isArray(upList) ? upList : []).map((prog: any) => ({
        ytVideoId: prog.ytVideoId || prog.videoId || prog.yt_video_id,
        title: prog.title || prog.name,
        startTime: prog.startTime || prog.start_time,
        endTime: prog.endTime || prog.end_time,
        duration: prog.duration,
      }))
      
      if (currentProgram && currentProgram.ytVideoId) {
        const headers = {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Origin': '*',
        }
        
        return NextResponse.json({
          serverTime,
          currentProgram,
          previousPrograms,
          upcomingPrograms,
          _source: scheduleData._source || 'external-api',
        }, { headers })
      }
    }
    
    // Fallback to local schedule data
    console.log('📋 Using local schedule data for channel:', channelId)
    const data = getCurrentProgram(channelId)
    const upcomingResult = getUpcomingPrograms(channelId, 10)
    const programs = getChannelPrograms(channelId)
    
    // Calculate program start/end times
    const programStartTime = serverTime - (data.currentTime * 1000)
    const programEndTime = programStartTime + (data.program.duration * 1000)
    
    // Format currentProgram in exact API format
    const currentProgram = {
      ytVideoId: data.program.videoId,
      title: data.program.title,
      startTime: programStartTime,
      endTime: programEndTime,
      duration: data.program.duration,
      seekTo: data.currentTime
    }
    
    // Calculate previousPrograms - programs that already played in current cycle
    const previousPrograms: Array<{
      ytVideoId: string
      title: string
      startTime: number
      endTime: number
      duration: number
    }> = []
    
    // Get programs that played before current in this cycle
    let prevEndTime = programStartTime
    for (let i = data.programIndex - 1; i >= 0 && previousPrograms.length < 5; i--) {
      const prog = programs[i]
      const endTime = prevEndTime
      const startTime = endTime - (prog.duration * 1000)
      previousPrograms.unshift({
        ytVideoId: prog.videoId,
        title: prog.title,
        startTime,
        endTime,
        duration: prog.duration
      })
      prevEndTime = startTime
    }
    
    // If we need more previous programs, wrap around from end of schedule (previous cycle)
    if (previousPrograms.length < 5 && data.programIndex < 5) {
      const needed = 5 - previousPrograms.length
      for (let i = programs.length - 1; i >= programs.length - needed && i >= 0; i--) {
        const prog = programs[i]
        const endTime = prevEndTime
        const startTime = endTime - (prog.duration * 1000)
        previousPrograms.unshift({
          ytVideoId: prog.videoId,
          title: prog.title,
          startTime,
          endTime,
          duration: prog.duration
        })
        prevEndTime = startTime
      }
    }
    
    // Format upcomingPrograms in exact API format
    let nextStartTime = programEndTime
    const upcomingPrograms = upcomingResult.upcoming.map(prog => {
      const startTime = nextStartTime
      const endTime = startTime + (prog.duration * 1000)
      nextStartTime = endTime
      return {
        ytVideoId: prog.videoId,
        title: prog.title,
        startTime,
        endTime,
        duration: prog.duration
      }
    })
    
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    }
    
    // Return EXACT format as specified
    return NextResponse.json({
      serverTime,
      currentProgram,
      previousPrograms,
      upcomingPrograms,
      _source: 'local-schedule',
    }, { headers })
  } catch (error) {
    console.error('Error fetching current video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch current video' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0