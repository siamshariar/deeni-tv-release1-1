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
  channelId: string
  thumbnail?: string
  watchedAt?: number // timestamp when video was watched (for previous list)
}

export interface Channel {
  id: string
  name: string
  language: string
  icon: string
  programs: VideoProgram[]
}

export interface CurrentVideoData {
  program: VideoProgram
  currentTime: number
  timeRemaining: number
  nextProgram: VideoProgram
  serverTime: number
  programIndex: number
  epochStart?: number
  nextProgramStartTime?: number
  usingFallback?: boolean
}

export interface ApiResponse {
  success: boolean
  data: CurrentVideoData & {
    nextProgramStartTime: number
    scheduleVersion: string
    totalPrograms: number
    channelId: string
    previousVideos?: VideoProgram[]
    upcomingVideos?: VideoProgram[]
  }
  serverTimestamp: number
}