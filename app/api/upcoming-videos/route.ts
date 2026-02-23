import { NextResponse } from 'next/server'
import { getCurrentProgram, getUpcomingPrograms, SCHEDULE_VERSION, MASTER_EPOCH_START } from '@/lib/schedule-utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '15')
    const channelId = searchParams.get('channel') || 'bangla-1'
    
    const current = getCurrentProgram(channelId)
    const { 
      upcoming, 
      nextStartTimes, 
      nextStartAbsolute, 
      programIndices,
      scheduledPreloads 
    } = getUpcomingPrograms(channelId, count)
    
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    }
    
    const upcomingWithMeta = upcoming.map((program, index) => ({
      ...program,
      isFirstInNextCycle: programIndices[index] === 0 && current.programIndex === current.totalPrograms - 1,
      isWrapAround: programIndices[index] < current.programIndex,
      startTime: nextStartTimes[index],
      absoluteStartTime: nextStartAbsolute[index],
      preloadTime: nextStartAbsolute[index] - (5 * 60 * 1000)
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        current: current.program,
        currentIndex: current.programIndex,
        currentTime: current.currentTime,
        timeRemaining: current.timeRemaining,
        nextProgramStartTime: current.nextProgramStartTime,
        upcoming: upcomingWithMeta,
        nextStartTimes,
        nextStartAbsolute,
        programIndices,
        scheduledPreloads,
        serverTime: Date.now(),
        epochStart: MASTER_EPOCH_START,
        totalPrograms: current.totalPrograms,
        scheduleVersion: SCHEDULE_VERSION,
        isLastInCycle: current.programIndex === current.totalPrograms - 1,
        willWrapToFirst: current.programIndex === current.totalPrograms - 1
      }
    }, { headers })
  } catch (error) {
    console.error('Error fetching upcoming videos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch upcoming videos' 
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0