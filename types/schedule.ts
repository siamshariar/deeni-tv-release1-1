export interface VideoProgram {
  id: string
  videoId: string
  title: string
  description: string
  duration: number // in seconds
  startTime?: Date
  endTime?: Date
  category: string
  language: string
  thumbnail?: string
}

export interface CurrentVideoData {
  program: VideoProgram
  currentTime: number
  timeRemaining: number
  nextProgram: VideoProgram
  serverTime: number
  programIndex: number
  epochStart?: number
  nextProgramStartTime?: number // timestamp when next program starts
}

export interface UpcomingProgramInfo {
  program: VideoProgram
  startTime: number // relative seconds from now
  absoluteStartTime: number // timestamp
  isFirstInNextCycle: boolean
  isWrapAround: boolean
}

export interface ScheduledUpdate {
  programId: string
  scheduledTime: number // timestamp when to update
  videoId: string
  action: 'preload' | 'switch'
}