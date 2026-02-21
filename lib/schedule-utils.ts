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

// Master epoch start - ALL USERS SYNC TO THIS
export const MASTER_EPOCH_START = Date.UTC(2024, 0, 1, 0, 0, 0) // 2024-01-01 00:00:00 UTC
export const SCHEDULE_VERSION = '1.0.0'

export function getTotalScheduleDuration() {
  return SCHEDULE.reduce((sum, prog) => sum + prog.duration, 0)
}

/**
 * Calculate which video should be playing right now
 * ALL USERS GET THE EXACT SAME RESULT AT THE SAME MOMENT
 */
export function getCurrentProgram(): CurrentVideoData & { 
  nextProgramStartTime: number, 
  scheduleVersion: string,
  absoluteCurrentTime: number,
  cyclePosition: number
} {
  const now = Date.now()
  const totalDuration = getTotalScheduleDuration()
  
  // Calculate position from master epoch
  const elapsedSinceEpoch = Math.floor((now - MASTER_EPOCH_START) / 1000)
  const cyclePosition = elapsedSinceEpoch % totalDuration
  
  // Find current program
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
  
  const nextProgram = SCHEDULE[(programIndex + 1) % SCHEDULE.length]
  
  // Calculate when the next program starts
  const currentCycleStart = MASTER_EPOCH_START + 
    Math.floor((now - MASTER_EPOCH_START) / totalDuration / 1000) * totalDuration * 1000
  
  const nextProgramStartTime = currentCycleStart + 
    (accumulatedTime + currentProgram.duration) * 1000
  
  const timeRemaining = currentProgram.duration - currentTime
  
  return {
    program: currentProgram,
    currentTime,
    timeRemaining,
    nextProgram,
    serverTime: now,
    programIndex,
    epochStart: MASTER_EPOCH_START,
    nextProgramStartTime,
    scheduleVersion: SCHEDULE_VERSION,
    usingFallback: false,
    absoluteCurrentTime: currentTime,
    cyclePosition
  }
}

/**
 * Get upcoming programs
 */
export function getUpcomingPrograms(count: number = 15) {
  const current = getCurrentProgram()
  const currentIndex = current.programIndex >= 0 ? current.programIndex : 0
  
  const upcoming: VideoProgram[] = []
  const nextStartTimes: number[] = []
  const nextStartAbsolute: number[] = []
  const programIndices: number[] = []

  let offset = current.timeRemaining
  let absoluteTime = current.nextProgramStartTime

  for (let i = 1; i <= count; i++) {
    const index = (currentIndex + i) % SCHEDULE.length
    const prog = SCHEDULE[index]
    
    upcoming.push(prog)
    programIndices.push(index)

    nextStartTimes.push(offset)
    nextStartAbsolute.push(absoluteTime)

    offset += prog.duration
    absoluteTime += prog.duration * 1000
  }

  return {
    upcoming,
    nextStartTimes,
    nextStartAbsolute,
    programIndices
  }
}

/**
 * Format time in seconds to MM:SS or HH:MM:SS
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
 * Format duration in seconds to human readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} secs`
  
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    if (mins > 0) {
      return `${hours}h ${mins}m`
    }
    return `${hours}h`
  }
  
  if (mins === 1) return `${mins} min`
  return `${mins} mins`
}