import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/fetch'

const EXTERNAL_API_BASE = 'https://api.deeniinfotech.com/api/tv-schedules'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channel') || 'bangla-1'
    const isQuran = searchParams.get('is') === 'true'
    
    // Map internal channel IDs to API language IDs (lid)
    const channelToLidMap: Record<string, number> = {
      'bangla-1': 5,
      'english-1': 6,
      'arabic-1': 7,
      'urdu-1': 8,
      'chinese-1': 9,
      'quran-bangla': 5,
      'quran-english': 6,
      'quran-arabic': 7,
      'quran-chinese': 9,
    }
    
    const lid = channelToLidMap[channelId] || 5
    
    // Build the API URL
    let apiUrl = `${EXTERNAL_API_BASE}/live?lid=${lid}`
    
    // If it's a Quran channel, add IS=true parameter
    if (isQuran || channelId.startsWith('quran-')) {
      apiUrl += '&IS=true'
    }
    
    console.log(`📡 Fetching from external API with JWT auth: ${apiUrl}`)
    
    const apiKey = process.env.NP_AS_L
    if (!apiKey) {
      console.error('❌ NP_AS_L environment variable not set')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }
    
    // Use JWT-authenticated fetch (same pattern as Quran Tube)
    const data = await fetchWithAuth(apiUrl)
    console.log('✅ External API response received:', JSON.stringify(data).substring(0, 200))
    
    // Transform external API response to our internal format
    const serverTime = Date.now()
    
    // Handle the external API response format 
    // The API returns schedule data - adapt it to our format
    let currentProgram = null
    let previousPrograms: any[] = []
    let upcomingPrograms: any[] = []
    
    if (data.currentProgram || data.current) {
      const curr = data.currentProgram || data.current
      currentProgram = {
        ytVideoId: curr.ytVideoId || curr.videoId || curr.yt_video_id,
        title: curr.title || curr.name,
        startTime: curr.startTime || curr.start_time || serverTime,
        endTime: curr.endTime || curr.end_time || (serverTime + (curr.duration || 3600) * 1000),
        duration: curr.duration || 3600,
        seekTo: curr.seekTo || curr.seek_to || 0,
      }
    }
    
    if (data.previousPrograms || data.previous) {
      const prevList = data.previousPrograms || data.previous || []
      previousPrograms = (Array.isArray(prevList) ? prevList : []).map((prog: any) => ({
        ytVideoId: prog.ytVideoId || prog.videoId || prog.yt_video_id,
        title: prog.title || prog.name,
        startTime: prog.startTime || prog.start_time,
        endTime: prog.endTime || prog.end_time,
        duration: prog.duration,
      }))
    }
    
    if (data.upcomingPrograms || data.upcoming) {
      const upList = data.upcomingPrograms || data.upcoming || []
      upcomingPrograms = (Array.isArray(upList) ? upList : []).map((prog: any) => ({
        ytVideoId: prog.ytVideoId || prog.videoId || prog.yt_video_id,
        title: prog.title || prog.name,
        startTime: prog.startTime || prog.start_time,
        endTime: prog.endTime || prog.end_time,
        duration: prog.duration,
      }))
    }
    
    // If the API returns data in a different structure, pass it through
    // and let the client handle it
    const result = {
      serverTime,
      currentProgram: currentProgram || data.currentProgram || data.current || null,
      previousPrograms: previousPrograms.length > 0 ? previousPrograms : (data.previousPrograms || data.previous || []),
      upcomingPrograms: upcomingPrograms.length > 0 ? upcomingPrograms : (data.upcomingPrograms || data.upcoming || []),
      // Also pass the raw external API response for debugging
      _raw: data,
    }
    
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    }
    
    return NextResponse.json(result, { headers })
  } catch (error) {
    console.error('❌ Error in live schedule API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live schedule', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
