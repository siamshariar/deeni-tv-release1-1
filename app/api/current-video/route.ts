import { NextResponse } from 'next/server'
import { getCurrentProgram, SCHEDULE, SCHEDULE_VERSION, MASTER_EPOCH_START } from '@/lib/schedule-utils'

export async function GET() {
  try {
    const data = getCurrentProgram()
    
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        isLastInCycle: data.programIndex === SCHEDULE.length - 1,
        isFirstInCycle: data.programIndex === 0,
        totalPrograms: SCHEDULE.length,
        scheduleVersion: SCHEDULE_VERSION,
        masterEpoch: MASTER_EPOCH_START // Send master epoch to client for local calculations
      },
      serverTimestamp: Date.now()
    }, { headers })
  } catch (error) {
    console.error('Error fetching current video:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch current video' 
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0