import { VideoProgram, CurrentVideoData } from '@/types/schedule'

// Dr. Khandaker Abdullah Jahangir schedule
export const SCHEDULE: VideoProgram[] = [
  {
    id: '1',
    videoId: 'BPf0rhGKM-Q',
    title: 'হৃদয় স্পর্শ করার মত কিছু কথা',
    description: 'A heartfelt, full-length lecture',
    duration: 5820, // 97 minutes
    startTime: new Date(),
    endTime: new Date(),
    category: 'Lecture',
    language: 'Bengali',
    thumbnail: 'https://img.youtube.com/vi/BPf0rhGKM-Q/maxresdefault.jpg'
  },
  {
    id: '2',
    videoId: 'fXSwr_njN5U',
    title: 'Ramadan Guide – রমজান পূর্ব প্রস্তুতি',
    description: 'Dr. Abdullah Jahangir explains important Ramadan details and preparation.',
    duration: 1494, // 24.9 minutes
    startTime: new Date(),
    endTime: new Date(),
    category: 'Lecture',
    language: 'Bengali',
    thumbnail: 'https://img.youtube.com/vi/fXSwr_njN5U/maxresdefault.jpg'
  },
  {
    id: '3',
    videoId: 'MsyOd9nnXRM',
    title: 'Ramadan FAQs – রামাদান প্রশ্নোত্তর',
    description: 'Dr. Abdullah Jahangir answers common Ramadan fasting questions.',
    duration: 1023, // 17.05 minutes
    startTime: new Date(),
    endTime: new Date(),
    category: 'Lecture',
    language: 'Bengali',
    thumbnail: 'https://img.youtube.com/vi/MsyOd9nnXRM/maxresdefault.jpg'
  },
  {
    id: '4',
    videoId: 'O03n_lX0lnU',
    title: 'Important Ramadan Answers – মাহে রমজান সম্পর্কিত প্রশ্নের উত্তর',
    description: '20 key Ramadan questions answered by Dr. Abdullah Jahangir.',
    duration: 900, // 15 minutes
    startTime: new Date(),
    endTime: new Date(),
    category: 'Lecture',
    language: 'Bengali',
    thumbnail: 'https://img.youtube.com/vi/O03n_lX0lnU/maxresdefault.jpg'
  },
  {
    id: '5',
    videoId: 'wX1AEPleTHw',
    title: 'Siyam Sunnah & Rules – রোজার নিয়ত ও সুন্নত',
    description: 'Complete guide to fasting intention and Sunnah by Dr. Abdullah Jahangir.',
    duration: 1200, // 20 minutes
    startTime: new Date(),
    endTime: new Date(),
    category: 'Lecture',
    language: 'Bengali',
    thumbnail: 'https://img.youtube.com/vi/wX1AEPleTHw/maxresdefault.jpg'
  }
]

// Fallback videos
export const FALLBACK_VIDEOS: VideoProgram[] = [
  {
    id: 'fallback-1',
    videoId: 'jfKfPfyJRdk',
    title: 'Lofi Study Music',
    description: 'Relaxing lofi beats - Fallback content',
    duration: 7200,
    startTime: new Date(),
    endTime: new Date(),
    category: 'Music',
    language: 'Instrumental',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg'
  },
  {
    id: 'fallback-2',
    videoId: '5qap5aO4i9A',
    title: 'Chill Lofi Beats',
    description: 'Chill lofi hip hop beats - Fallback content',
    duration: 7200,
    startTime: new Date(),
    endTime: new Date(),
    category: 'Music',
    language: 'Instrumental',
    thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/maxresdefault.jpg'
  }
]

// Track video failures
const videoFailureCount: Map<string, number> = new Map()
const MAX_FAILURES = 3

// Master epoch start - THIS IS THE KEY TO PERFECT SYNC
// All users calculate their position based on this absolute timestamp
export const MASTER_EPOCH_START = Date.UTC(2024, 0, 1, 0, 0, 0) // 2024-01-01 00:00:00 UTC
export const SCHEDULE_VERSION = '1.0.0'

export function getTotalScheduleDuration() {
  return SCHEDULE.reduce((sum, prog) => sum + prog.duration, 0)
}

/**
 * Check if a video is likely embeddable
 */
export function isVideoEmbeddable(videoId: string): boolean {
  const failures = videoFailureCount.get(videoId) || 0
  return failures < MAX_FAILURES
}

/**
 * Record a video failure
 */
export function recordVideoFailure(videoId: string) {
  const current = videoFailureCount.get(videoId) || 0
  videoFailureCount.set(videoId, current + 1)
  console.warn(`Video ${videoId} failed ${current + 1} times`)
}

/**
 * Reset failure count for a video
 */
export function resetVideoFailures(videoId: string) {
  videoFailureCount.delete(videoId)
}

/**
 * Get a fallback video
 */
export function getFallbackVideo(): VideoProgram {
  const index = Math.floor(Date.now() / 3600000) % FALLBACK_VIDEOS.length
  return FALLBACK_VIDEOS[index]
}

/**
 * Calculate which video should be playing right now
 * THIS FUNCTION RETURNS THE EXACT SAME RESULT FOR ALL USERS AT THE SAME MOMENT
 */
export function getCurrentProgram(): CurrentVideoData & { 
  nextProgramStartTime: number, 
  scheduleVersion: string,
  absoluteCurrentTime: number,
  cyclePosition: number
} {
  const now = Date.now()
  const totalDuration = getTotalScheduleDuration()
  
  // Calculate position from master epoch - THIS IS THE KEY
  // Every user calculates the same elapsed time from the same starting point
  const elapsedSinceEpoch = Math.floor((now - MASTER_EPOCH_START) / 1000)
  const cyclePosition = elapsedSinceEpoch % totalDuration
  
  // Find which program is currently playing
  let accumulatedTime = 0
  let currentProgram = SCHEDULE[0]
  let currentTime = 0
  let programIndex = 0
  
  for (let i = 0; i < SCHEDULE.length; i++) {
    const program = SCHEDULE[i]
    if (cyclePosition >= accumulatedTime && cyclePosition < accumulatedTime + program.duration) {
      currentProgram = program
      currentTime = cyclePosition - accumulatedTime
      programIndex = i
      break
    }
    accumulatedTime += program.duration
  }
  
  const embeddable = isVideoEmbeddable(currentProgram.videoId)
  const finalProgram = embeddable ? currentProgram : getFallbackVideo()
  const finalIndex = embeddable ? programIndex : -1
  
  const nextProgram = embeddable 
    ? SCHEDULE[(programIndex + 1) % SCHEDULE.length]
    : getFallbackVideo()
  
  // Calculate when the next program starts (absolute timestamp)
  const currentCycleStart = MASTER_EPOCH_START + 
    Math.floor((now - MASTER_EPOCH_START) / totalDuration / 1000) * totalDuration * 1000
  
  const nextProgramStartTime = currentCycleStart + 
    (accumulatedTime + currentProgram.duration) * 1000
  
  const timeRemaining = finalProgram.duration - currentTime
  
  return {
    program: finalProgram,
    currentTime,
    timeRemaining,
    nextProgram,
    serverTime: now,
    programIndex: finalIndex,
    epochStart: MASTER_EPOCH_START,
    nextProgramStartTime,
    scheduleVersion: SCHEDULE_VERSION,
    usingFallback: !embeddable,
    absoluteCurrentTime: currentTime,
    cyclePosition
  }
}

/**
 * Get upcoming programs with scheduled preload times
 */
export function getUpcomingPrograms(count: number = 15) {
  const current = getCurrentProgram()
  const currentIndex = current.programIndex >= 0 ? current.programIndex : 0
  
  const upcoming: VideoProgram[] = []
  const nextStartTimes: number[] = []
  const nextStartAbsolute: number[] = []
  const programIndices: number[] = []
  const scheduledPreloads: { programId: string, preloadTime: number, videoId: string }[] = []

  let offset = current.timeRemaining
  let absoluteTime = current.nextProgramStartTime

  for (let i = 1; i <= count; i++) {
    const index = (currentIndex + i) % SCHEDULE.length
    const prog = SCHEDULE[index]
    
    const embeddable = isVideoEmbeddable(prog.videoId)
    const finalProg = embeddable ? prog : getFallbackVideo()
    
    upcoming.push(finalProg)
    programIndices.push(embeddable ? index : -1)

    nextStartTimes.push(offset)
    nextStartAbsolute.push(absoluteTime)
    
    // Schedule preload 5 minutes before program starts
    const preloadTime = absoluteTime - (5 * 60 * 1000)
    if (preloadTime > Date.now()) {
      scheduledPreloads.push({
        programId: finalProg.id,
        preloadTime,
        videoId: finalProg.videoId
      })
    }

    offset += prog.duration
    absoluteTime += prog.duration * 1000
  }

  return {
    upcoming,
    nextStartTimes,
    nextStartAbsolute,
    programIndices,
    scheduledPreloads
  }
}

/**
 * Check for scheduled preloads
 */
export function checkScheduledPreloads(): { programId: string, preloadTime: number, videoId: string }[] {
  const now = Date.now()
  const { scheduledPreloads } = getUpcomingPrograms(20)
  
  return scheduledPreloads.filter(preload => 
    preload.preloadTime <= now + 1000 &&
    preload.preloadTime > now - 5000
  )
}

/**
 * Format time
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0
  
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins} mins`
}