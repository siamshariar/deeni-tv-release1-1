import { NextResponse } from 'next/server'
import { getCurrentProgram, CHANNELS, SCHEDULE_VERSION, MASTER_EPOCH_START } from '@/lib/schedule-utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channel') || CHANNELS[0].id
    
    const data = getCurrentProgram(channelId)
    const serverTime = Date.now()
    
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        isLastInCycle: data.programIndex === data.totalPrograms - 1,
        isFirstInCycle: data.programIndex === 0,
        scheduleVersion: SCHEDULE_VERSION,
        masterEpoch: MASTER_EPOCH_START,
        availableChannels: CHANNELS.map(c => ({ id: c.id, name: c.name, language: c.language, icon: c.icon }))
      },
      serverTimestamp: serverTime
    }, { headers })
  } catch (error) {
    console.error('Error fetching current video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch current video' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0