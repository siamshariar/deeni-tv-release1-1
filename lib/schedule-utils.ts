import { VideoProgram, CurrentVideoData, Channel } from '@/types/schedule'

// Bengali Channel - Dr. Abdullah Jahangir videos
const BENGALI_VIDEOS: VideoProgram[] = [
  {
    id: 'b1',
    videoId: 'BPf0rhGKM-Q',
    title: 'হৃদয় স্পর্শ করার মত কিছু কথা',
    description: 'ড. আব্দুল্লাহ জাহাঙ্গীর এর হৃদয়স্পর্শী আলোচনা',
    duration: 5820,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/BPf0rhGKM-Q/maxresdefault.jpg'
  },
  {
    id: 'b2',
    videoId: 'fXSwr_njN5U',
    title: 'Ramadan Guide – রমজান পূর্ব প্রস্তুতি',
    description: 'রমজানের প্রস্তুতি সম্পর্কে ড. আব্দুল্লাহ জাহাঙ্গীর এর আলোচনা',
    duration: 1494,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/fXSwr_njN5U/maxresdefault.jpg'
  },
  {
    id: 'b3',
    videoId: 'MsyOd9nnXRM',
    title: 'Ramadan FAQs – রামাদান প্রশ্নোত্তর',
    description: 'রমজান সম্পর্কিত সাধারণ জিজ্ঞাসার উত্তর',
    duration: 1023,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/MsyOd9nnXRM/maxresdefault.jpg'
  },
  {
    id: 'b4',
    videoId: 'O03n_lX0lnU',
    title: 'Important Ramadan Answers – মাহে রমজান সম্পর্কিত প্রশ্নের উত্তর',
    description: '২০টি গুরুত্বপূর্ণ রমজান প্রশ্নের উত্তর',
    duration: 900,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/O03n_lX0lnU/maxresdefault.jpg'
  },
  {
    id: 'b5',
    videoId: 'wX1AEPleTHw',
    title: 'Siyam Sunnah & Rules – রোজার নিয়ত ও সুন্নত',
    description: 'রোজার নিয়ত ও সুন্নত সম্পর্কে ড. আব্দুল্লাহ জাহাঙ্গীর এর আলোচনা',
    duration: 1200,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/wX1AEPleTHw/maxresdefault.jpg'
  }
]

// English Channel - Ramadan videos
const ENGLISH_VIDEOS: VideoProgram[] = [
  {
    id: 'e1',
    videoId: 'TBjvoct0t5E',
    title: 'ALL of your Ramadan Questions Answered',
    description: 'Q&A on fasting, moon-sighting, health issues & rulings.',
    duration: 3600,
    category: 'Q&A',
    language: 'English',
    channelId: 'english-1',
    thumbnail: 'https://img.youtube.com/vi/TBjvoct0t5E/maxresdefault.jpg'
  },
  {
    id: 'e2',
    videoId: 'jNMXHNinAYE',
    title: 'Special Ramadan 2026 Q&A',
    description: 'Answers to common Ramadan questions (work-life balance, Qur\'an, fasting).',
    duration: 2700,
    category: 'Q&A',
    language: 'English',
    channelId: 'english-1',
    thumbnail: 'https://img.youtube.com/vi/jNMXHNinAYE/maxresdefault.jpg'
  },
  {
    id: 'e3',
    videoId: 'nMnPiELXfDs',
    title: 'Special Ramadan Q&A | Ask Shaykh YQ #61',
    description: 'Knowledge-focused Q&A with scholar responses.',
    duration: 4500,
    category: 'Q&A',
    language: 'English',
    channelId: 'english-1',
    thumbnail: 'https://img.youtube.com/vi/nMnPiELXfDs/maxresdefault.jpg'
  },
  {
    id: 'e4',
    videoId: 'qyeV34J6riI',
    title: 'Q&A: Making up Broken Qada Fast (Mufti Abdur Rahman)',
    description: 'Scholarly discussion on making up missed fasts.',
    duration: 3200,
    category: 'Q&A',
    language: 'English',
    channelId: 'english-1',
    thumbnail: 'https://img.youtube.com/vi/qyeV34J6riI/maxresdefault.jpg'
  },
  {
    id: 'e5',
    videoId: 'XOTlqHSCUp0',
    title: 'Can we Abstain from Fasting during Examinations? - Dr Zakir Naik',
    description: 'Scholar answers practical fasting questions for students.',
    duration: 2800,
    category: 'Q&A',
    language: 'English',
    channelId: 'english-1',
    thumbnail: 'https://img.youtube.com/vi/XOTlqHSCUp0/maxresdefault.jpg'
  }
]

// Arabic Channel - Ramadan videos
const ARABIC_VIDEOS: VideoProgram[] = [
  {
    id: 'a1',
    videoId: 'uWA_K1gWws8',
    title: 'اسئلة واجوبة في الصوم والإفطار – الشيخ صالح الفوزان',
    description: 'شرح كبير بأسلوب الأسئلة والأجوبة حول أحكام الصيام',
    duration: 5400,
    category: 'Q&A',
    language: 'Arabic',
    channelId: 'arabic-1',
    thumbnail: 'https://img.youtube.com/vi/uWA_K1gWws8/maxresdefault.jpg'
  },
  {
    id: 'a2',
    videoId: 'vAP3XMgOpEU',
    title: 'Iftar Etiquette & Major Nullifiers of Fasting',
    description: 'يغطي الفقه الهام لصوم رمضان',
    duration: 4200,
    category: 'Lecture',
    language: 'Arabic',
    channelId: 'arabic-1',
    thumbnail: 'https://img.youtube.com/vi/vAP3XMgOpEU/maxresdefault.jpg'
  },
  {
    id: 'a3',
    videoId: 'Iu2af50jiow',
    title: 'أسئلة دينية عن شهر رمضان – 50 سؤال وجواب',
    description: 'أسئلة وأجوبة تعليمية على شكل اختبار باللغة العربية',
    duration: 7200,
    category: 'Q&A',
    language: 'Arabic',
    channelId: 'arabic-1',
    thumbnail: 'https://img.youtube.com/vi/Iu2af50jiow/maxresdefault.jpg'
  },
  {
    id: 'a4',
    videoId: 'QdmoSCQEH-o',
    title: '30 سؤال وجواب عن الصيام – Ramadan Knowledge',
    description: 'أسئلة تعليمية عن صيام رمضان',
    duration: 2400,
    category: 'Q&A',
    language: 'Arabic',
    channelId: 'arabic-1',
    thumbnail: 'https://img.youtube.com/vi/QdmoSCQEH-o/maxresdefault.jpg'
  },
  {
    id: 'a5',
    videoId: '5lFSrPoqkMw',
    title: 'اسئلة دينية صعبة جداً عن شهر رمضان',
    description: 'أسئلة وأجوبة إسلامية عميقة عن رمضان',
    duration: 6300,
    category: 'Q&A',
    language: 'Arabic',
    channelId: 'arabic-1',
    thumbnail: 'https://img.youtube.com/vi/5lFSrPoqkMw/maxresdefault.jpg'
  }
]

// Define channels
export const CHANNELS: Channel[] = [
  {
    id: 'bangla-1',
    name: 'বাংলা লেকচার',
    language: 'Bengali',
    icon: '🇧🇩',
    programs: BENGALI_VIDEOS
  },
  {
    id: 'english-1',
    name: 'English Lectures',
    language: 'English',
    icon: '🇬🇧',
    programs: ENGLISH_VIDEOS
  },
  {
    id: 'arabic-1',
    name: 'محاضرات عربية',
    language: 'Arabic',
    icon: '🇸🇦',
    programs: ARABIC_VIDEOS
  }
]

// Export SCHEDULE for backward compatibility
export const SCHEDULE: VideoProgram[] = BENGALI_VIDEOS

// Types for scheduled preloads
export interface ScheduledPreload {
  programId: string
  preloadTime: number
  videoId: string
}

export interface UpcomingProgramsResult {
  upcoming: VideoProgram[]
  nextStartTimes: number[]
  nextStartAbsolute: number[]
  programIndices: number[]
  scheduledPreloads: ScheduledPreload[]
}

// Master epoch start
export const MASTER_EPOCH_START = Date.UTC(2024, 0, 1, 0, 0, 0)
export const SCHEDULE_VERSION = '1.1.0'

// Local storage keys
export const STORAGE_KEY = 'deeni-tv-channel'
export const PREVIOUS_VIDEOS_KEY_PREFIX = 'deeni-tv-previous-'

// Get saved channel from localStorage
export function getSavedChannel(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return null
  }
}

// Save channel to localStorage
export function saveChannel(channelId: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, channelId)
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Get previous videos from localStorage for specific channel
export function getPreviousVideos(channelId: string): VideoProgram[] {
  if (typeof window === 'undefined') return []
  try {
    const key = `${PREVIOUS_VIDEOS_KEY_PREFIX}${channelId}`
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Error reading previous videos:', error)
    return []
  }
}

// Save previous videos to localStorage for specific channel
export function savePreviousVideos(channelId: string, videos: VideoProgram[]): void {
  if (typeof window === 'undefined') return
  try {
    const key = `${PREVIOUS_VIDEOS_KEY_PREFIX}${channelId}`
    // Keep only last 30 videos
    const recentVideos = videos.slice(0, 30)
    localStorage.setItem(key, JSON.stringify(recentVideos))
  } catch (error) {
    console.error('Error saving previous videos:', error)
  }
}

// Add video to previous list for specific channel
export function addToPreviousVideos(channelId: string, video: VideoProgram): VideoProgram[] {
  const previous = getPreviousVideos(channelId)
  
  // Add watched timestamp
  const watchedVideo = {
    ...video,
    watchedAt: Date.now()
  }
  
  // Remove if already exists
  const filtered = previous.filter(v => v.id !== video.id)
  
  // Add to beginning
  const updated = [watchedVideo, ...filtered].slice(0, 30)
  
  // Save to localStorage
  savePreviousVideos(channelId, updated)
  
  return updated
}

// Clear previous videos for a channel (for testing)
export function clearPreviousVideos(channelId: string): void {
  if (typeof window === 'undefined') return
  try {
    const key = `${PREVIOUS_VIDEOS_KEY_PREFIX}${channelId}`
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing previous videos:', error)
  }
}

// Get channel programs
export function getChannelPrograms(channelId: string): VideoProgram[] {
  const channel = CHANNELS.find(c => c.id === channelId)
  return channel?.programs || CHANNELS[0].programs
}

// Get total duration for a channel
export function getTotalScheduleDuration(channelId: string): number {
  const programs = getChannelPrograms(channelId)
  return programs.reduce((sum, prog) => sum + prog.duration, 0)
}

/**
 * Calculate current program for a specific channel
 */
export function getCurrentProgram(channelId: string): CurrentVideoData & { 
  nextProgramStartTime: number
  scheduleVersion: string
  totalPrograms: number
  channelId: string
} {
  const now = Date.now()
  const programs = getChannelPrograms(channelId)
  const totalDuration = programs.reduce((sum, prog) => sum + prog.duration, 0)
  
  const elapsedSinceEpoch = Math.floor((now - MASTER_EPOCH_START) / 1000)
  const cyclePosition = elapsedSinceEpoch % totalDuration
  
  let accumulatedTime = 0
  let currentProgram = programs[0]
  let currentTime = 0
  let programIndex = 0
  
  for (let i = 0; i < programs.length; i++) {
    const program = programs[i]
    if (cyclePosition >= accumulatedTime && cyclePosition < accumulatedTime + program.duration) {
      currentProgram = program
      currentTime = cyclePosition - accumulatedTime
      programIndex = i
      break
    }
    accumulatedTime += program.duration
  }
  
  const nextProgram = programs[(programIndex + 1) % programs.length]
  
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
    totalPrograms: programs.length,
    channelId
  }
}

/**
 * Get upcoming programs for a channel
 */
export function getUpcomingPrograms(channelId: string, count: number = 15): UpcomingProgramsResult {
  const current = getCurrentProgram(channelId)
  const programs = getChannelPrograms(channelId)
  const currentIndex = current.programIndex
  
  const upcoming: VideoProgram[] = []
  const nextStartTimes: number[] = []
  const nextStartAbsolute: number[] = []
  const programIndices: number[] = []
  const scheduledPreloads: ScheduledPreload[] = []

  let offset = current.timeRemaining
  let absoluteTime = current.nextProgramStartTime

  for (let i = 1; i <= count; i++) {
    const index = (currentIndex + i) % programs.length
    const prog = programs[index]
    
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
    programIndices,
    scheduledPreloads
  }
}

/**
 * Get previous programs from localStorage for a channel
 */
export function getPreviousPrograms(channelId: string, count: number = 15): VideoProgram[] {
  const previous = getPreviousVideos(channelId)
  return previous.slice(0, count)
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
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  return `0:${secs.toString().padStart(2, '0')}`
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