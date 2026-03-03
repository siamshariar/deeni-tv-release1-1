import { NextResponse } from 'next/server'
import { getCurrentProgram, getUpcomingPrograms, getChannelPrograms, CHANNELS, MASTER_EPOCH_START, CHANNEL_LID_MAP, isQuranChannel } from '@/lib/schedule-utils'

/**
 * /api/current-video — local schedule fallback only.
 *
 * The external API (deeniinfotech.com) is now called DIRECTLY from the browser
 * in synced-video-player.tsx via clientFetchWithAuth(). Cloudflare blocks
 * server-to-server requests from this EC2 IP, but allows real browser traffic.
 *
 * This route serves local schedule data as a fallback when the external
 * API call fails or is unavailable.
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channel') || CHANNELS[0].id
    
    const serverTime = Date.now()
    
    // Local schedule data (used as fallback when browser external API call fails)
    console.log('📋 Serving local schedule data for channel:', channelId)
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