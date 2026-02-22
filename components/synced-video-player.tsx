'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Volume2, VolumeX, Maximize, MoreHorizontal, Minimize, 
  Tv, Clock, ArrowRight, Eye, EyeOff, Repeat, Volume1, 
  Volume, AlertCircle, RefreshCw, Play, Loader2, Radio,
  WifiOff, RotateCw, RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useMediaQuery } from '@/hooks/use-media-query'
import { CurrentVideoData, VideoProgram } from '@/types/schedule'
import { 
  formatTime, 
  SCHEDULE, 
  MASTER_EPOCH_START, 
  getTotalScheduleDuration,
  getCurrentProgram
} from '@/lib/schedule-utils'
import { useYouTubePlayer, YT_STATE } from '@/hooks/use-youtube-player'

interface SyncedVideoPlayerProps {
  onMenuOpen: () => void
  onChannelSwitcherOpen: () => void
}

// API Response Types
interface ApiResponse {
  success: boolean
  data: CurrentVideoData & {
    nextProgramStartTime: number
    scheduleVersion: string
    totalPrograms: number
    isLastInCycle: boolean
  }
  serverTimestamp: number
}

// Start Screen Component
const StartScreen = ({ onPlayClick }: { onPlayClick: () => void }) => {
  const isMobile = useMediaQuery('(max-width: 640px)')
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-zinc-900 to-black z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-center ${isMobile ? 'px-4 max-w-sm' : 'px-8 max-w-lg'}`}
      >
        <div className="relative mb-6 md:mb-8">
          <Radio className={`${isMobile ? 'h-16 w-16' : 'h-24 w-24'} text-primary mx-auto`} />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
          />
        </div>
        
        <h1 className={`font-bold text-white mb-2 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
          Deeni.tv
        </h1>
        
        <p className={`text-white/60 mb-6 md:mb-8 ${isMobile ? 'text-base' : 'text-xl'}`}>
          Your Spiritual TV Experience
        </p>
        
        <Button
          onClick={onPlayClick}
          size={isMobile ? "default" : "lg"}
          className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg px-8 py-6 text-lg"
        >
          <Play className="h-6 w-6 mr-3 fill-current" />
          Start Watching
        </Button>
        
        <p className={`text-white/40 mt-4 md:mt-6 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          Click to load and start your spiritual journey
        </p>
      </motion.div>
    </motion.div>
  )
}

// Live Badge Component
const LiveBadge = ({ variant = 'default', isMobile = false }: { variant?: 'default' | 'transparent', isMobile?: boolean }) => {
  if (variant === 'transparent') {
    return (
      <div className={`flex items-center gap-1.5 ${isMobile ? 'px-1.5 py-0.5' : 'px-2 py-1'} bg-black/40 backdrop-blur-sm border border-white/20 rounded-full`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute bg-red-500 rounded-full"></span>
          <span className="relative bg-red-500 rounded-full h-2 w-2"></span>
        </span>
        <span className={`text-white font-bold uppercase tracking-wider ${isMobile ? 'text-[8px]' : 'text-[10px] sm:text-xs'}`}>LIVE</span>
      </div>
    )
  }
  
  return (
    <div className={`flex items-center gap-2 bg-green-500/20 text-green-300 ${isMobile ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} rounded-full border border-green-500/30`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute bg-green-500 rounded-full"></span>
        <span className="relative bg-green-500 rounded-full h-2 w-2"></span>
      </span>
      <span>Live</span>
    </div>
  )
}

// Scrolling Upcoming Videos - Shows ALL upcoming items
const ScrollingUpcomingVideos = ({ videos, currentIndex, isMobile, isFullscreen }: { 
  videos: VideoProgram[], 
  currentIndex: number,
  isMobile: boolean,
  isFullscreen: boolean 
}) => {
  if (videos.length === 0) {
    return (
      <div className="relative flex overflow-hidden h-full items-center">
        <motion.div 
          animate={{ x: [0, -500] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap"
        >
          <span className={`text-primary font-semibold px-2 ${isMobile && isFullscreen ? 'text-[8px]' : 'text-[10px] sm:text-xs'}`}>
            More content coming...
          </span>
        </motion.div>
      </div>
    )
  }

  // Create scrolling items with proper labels
  const items: string[] = []
  const repeatCount = 4 // Repeat 4 times for continuous scroll
  
  for (let i = 0; i < repeatCount; i++) {
    videos.forEach((video, index) => {
      const isFirstInNextCycle = index === 0 && currentIndex === SCHEDULE.length - 1
      const prefix = index === 0 ? 'NEXT' : 'UP NEXT'
      const duration = formatTime(video.duration)
      const wrapSymbol = isFirstInNextCycle ? '↻' : ''
      items.push(`${prefix}: ${video.title} • ${duration} ${wrapSymbol}`)
    })
  }

  return (
    <div className="relative flex overflow-hidden h-full items-center">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -3000] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} className={`text-primary font-semibold px-3 sm:px-4 ${isMobile && isFullscreen ? 'text-[8px]' : 'text-[10px] sm:text-xs'}`}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export function SyncedVideoPlayer({ onMenuOpen, onChannelSwitcherOpen }: SyncedVideoPlayerProps) {
  // UI State
  const [showControls, setShowControls] = useState(true)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(75)
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false)
  const [showTicker, setShowTicker] = useState(true)
  
  // Player State
  const [currentProgram, setCurrentProgram] = useState<VideoProgram | null>(null)
  const [nextProgram, setNextProgram] = useState<VideoProgram | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState('0:00')
  const [displayTime, setDisplayTime] = useState('0:00')
  const [cycleInfo, setCycleInfo] = useState({ current: 1, total: SCHEDULE.length })
  const [upcomingVideos, setUpcomingVideos] = useState<VideoProgram[]>([])
  
  // App State
  const [isLoading, setIsLoading] = useState(false)
  const [showStartScreen, setShowStartScreen] = useState(true)
  const [playerReady, setPlayerReady] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [serverTimeOffset, setServerTimeOffset] = useState(0)
  
  // Refs
  const playerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const lastVideoIdRef = useRef<string>('')
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)
  const masterEpochRef = useRef<number>(MASTER_EPOCH_START)
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // YouTube player hook
  const { 
    containerRef: youtubeContainerRef, 
    initializePlayer, 
    loadVideo, 
    setVolume: setYouTubeVolume,
    setMuted: setYouTubeMuted,
    seekTo,
    play,
    destroy
  } = useYouTubePlayer()

  /**
   * Update time display - runs every 100ms for smooth countdown
   */
  const updateTimeDisplay = useCallback(() => {
    if (!currentProgram) return
    
    // Calculate remaining time based on master epoch
    const now = Date.now() + serverTimeOffset
    const totalDuration = getTotalScheduleDuration()
    
    const elapsedSinceEpoch = Math.floor((now - masterEpochRef.current) / 1000)
    const cyclePosition = elapsedSinceEpoch % totalDuration
    
    let accumulatedTime = 0
    let foundTime = 0
    
    for (let i = 0; i < SCHEDULE.length; i++) {
      const program = SCHEDULE[i]
      if (cyclePosition >= accumulatedTime && cyclePosition < accumulatedTime + program.duration) {
        foundTime = cyclePosition - accumulatedTime
        break
      }
      accumulatedTime += program.duration
    }
    
    // Update current time
    setCurrentTime(foundTime)
    setDisplayTime(formatTime(foundTime))
    
    // Update time remaining
    if (currentProgram) {
      const remaining = Math.max(0, currentProgram.duration - foundTime)
      setTimeRemaining(formatTime(remaining))
    }
  }, [currentProgram, serverTimeOffset])

  /**
   * 1️⃣ API CALL ONLY AFTER ICON CLICK
   */
  const fetchAndStartVideo = useCallback(async () => {
    if (isLoading) return
    
    setIsLoading(true)
    setApiError(null)
    
    try {
      console.log('🎬 Icon clicked - calling API...')
      
      const clientTime = Date.now()
      const response = await fetch('/api/current-video', {
        headers: { 
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success || !result.data) {
        throw new Error('Invalid API response')
      }
      
      console.log('✅ API response received:', result.data)
      
      const offset = result.serverTimestamp - clientTime
      setServerTimeOffset(offset)
      
      if (result.data.masterEpoch) {
        masterEpochRef.current = result.data.masterEpoch
      }
      
      const program = result.data.program
      const startTime = result.data.currentTime
      
      setCurrentProgram(program)
      setNextProgram(result.data.nextProgram)
      setCurrentTime(startTime)
      setDisplayTime(formatTime(startTime))
      setTimeRemaining(formatTime(result.data.timeRemaining))
      setCycleInfo({ 
        current: result.data.programIndex + 1, 
        total: result.data.totalPrograms 
      })
      
      // Set upcoming videos (next 15 programs for continuous scroll)
      const upcoming: VideoProgram[] = []
      for (let i = 1; i <= 15; i++) {
        const nextIndex = (result.data.programIndex + i) % SCHEDULE.length
        upcoming.push(SCHEDULE[nextIndex])
      }
      setUpcomingVideos(upcoming)
      
      lastVideoIdRef.current = program.videoId
      
      await initializePlayer({
        videoId: program.videoId,
        startSeconds: Math.floor(startTime),
        volume: volume,
        muted: false,
        onReady: () => {
          console.log('✅ Player ready - starting playback')
          setPlayerReady(true)
          setIsLoading(false)
          setShowStartScreen(false)
          
          seekTo(startTime, true)
          play()
          
          setYouTubeVolume(volume)
          setYouTubeMuted(false)
        },
        onStateChange: (state) => {
          if (!mountedRef.current) return
          
          if (state === YT_STATE.ENDED) {
            console.log('📺 Video ended - playing next')
            playNextVideo()
          }
        },
        onError: (code, msg) => {
          console.error('Player error:', code, msg)
          setApiError(`Playback error: ${msg}`)
          setIsLoading(false)
        }
      })
      
    } catch (error) {
      console.error('API call failed:', error)
      setApiError(error instanceof Error ? error.message : 'Failed to load video')
      setIsLoading(false)
    }
  }, [isLoading, volume, initializePlayer, seekTo, play, setYouTubeVolume, setYouTubeMuted])

  /**
   * 2️⃣ Play next video in sequence
   */
  const playNextVideo = useCallback(async () => {
    if (!currentProgram || !nextProgram) return
    
    console.log('▶️ Playing next video:', nextProgram.title)
    
    const startTime = 0
    
    setCurrentProgram(nextProgram)
    setCurrentTime(startTime)
    setDisplayTime(formatTime(startTime))
    
    const currentIndex = SCHEDULE.findIndex(p => p.id === nextProgram.id)
    const nextNextIndex = (currentIndex + 1) % SCHEDULE.length
    const nextNextProgram = SCHEDULE[nextNextIndex]
    setNextProgram(nextNextProgram)
    
    setCycleInfo(prev => ({ 
      current: (prev.current % prev.total) + 1, 
      total: prev.total 
    }))
    
    // Update upcoming videos
    const upcoming: VideoProgram[] = []
    for (let i = 1; i <= 15; i++) {
      upcoming.push(SCHEDULE[(currentIndex + i) % SCHEDULE.length])
    }
    setUpcomingVideos(upcoming)
    
    lastVideoIdRef.current = nextProgram.videoId
    loadVideo(nextProgram.videoId, startTime)
    
    setYouTubeVolume(volume)
    setYouTubeMuted(isMuted)
    
  }, [currentProgram, nextProgram, loadVideo, volume, isMuted, setYouTubeVolume, setYouTubeMuted])

  /**
   * 3️⃣ SYNC API CALL EVERY 5 MINUTES
   */
  const syncWithServer = useCallback(async () => {
    if (!playerReady || !mountedRef.current) return
    
    try {
      console.log('🔄 Syncing with server (5-minute interval)...')
      
      const response = await fetch('/api/current-video', {
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (!response.ok) return
      
      const result = await response.json()
      
      if (!result.success || !result.data) return
      
      const offset = result.serverTimestamp - Date.now()
      setServerTimeOffset(offset)
      
      if (currentProgram && result.data.program.id !== currentProgram.id) {
        console.log('📺 Program changed on server - updating')
        
        setCurrentProgram(result.data.program)
        setNextProgram(result.data.nextProgram)
        setCurrentTime(result.data.currentTime)
        setDisplayTime(formatTime(result.data.currentTime))
        setTimeRemaining(formatTime(result.data.timeRemaining))
        setCycleInfo({ 
          current: result.data.programIndex + 1, 
          total: result.data.totalPrograms 
        })
        
        // Update upcoming videos
        const upcoming: VideoProgram[] = []
        for (let i = 1; i <= 15; i++) {
          const nextIndex = (result.data.programIndex + i) % SCHEDULE.length
          upcoming.push(SCHEDULE[nextIndex])
        }
        setUpcomingVideos(upcoming)
        
        if (lastVideoIdRef.current !== result.data.program.videoId) {
          lastVideoIdRef.current = result.data.program.videoId
          loadVideo(result.data.program.videoId, Math.floor(result.data.currentTime))
        } else {
          seekTo(result.data.currentTime, true)
        }
      }
      
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }, [playerReady, currentProgram, loadVideo, seekTo])

  /**
   * Handle reload/refresh
   */
  const handleReload = useCallback(() => {
    console.log('🔄 Reloading...')
    setShowStartScreen(true)
    setPlayerReady(false)
    setCurrentProgram(null)
    setApiError(null)
    destroy()
    
    setTimeout(() => {
      setShowStartScreen(true)
    }, 100)
  }, [destroy])

  /**
   * Set up time update interval - runs every 100ms for smooth countdown
   */
  useEffect(() => {
    if (!playerReady || !currentProgram) return
    
    timeUpdateIntervalRef.current = setInterval(() => {
      updateTimeDisplay()
    }, 100)
    
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current)
      }
    }
  }, [playerReady, currentProgram, updateTimeDisplay])

  /**
   * Set up 5-minute sync interval
   */
  useEffect(() => {
    if (!playerReady) return
    
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
    }
    
    syncIntervalRef.current = setInterval(() => {
      syncWithServer()
    }, 300000) // 5 minutes
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [playerReady, syncWithServer])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    mountedRef.current = true
    
    return () => {
      mountedRef.current = false
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current)
      }
      destroy()
    }
  }, [destroy])

  /**
   * Volume handlers
   */
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setShowVolumeTooltip(true)
    setYouTubeVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
      setYouTubeMuted(false)
    }
    setTimeout(() => setShowVolumeTooltip(false), 1000)
  }, [isMuted, setYouTubeVolume, setYouTubeMuted])

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    setYouTubeMuted(newMuted)
    if (!newMuted) setYouTubeVolume(volume)
  }, [isMuted, setYouTubeMuted, setYouTubeVolume, volume])

  // Activity handlers for controls
  const handleActivity = useCallback(() => {
    setControlsVisible(true)
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false)
      setShowControls(false)
    }, 3000)
  }, [])

  useEffect(() => {
    const el = playerRef.current
    if (el) {
      el.addEventListener('mousemove', handleActivity)
      el.addEventListener('touchstart', handleActivity)
      return () => {
        el.removeEventListener('mousemove', handleActivity)
        el.removeEventListener('touchstart', handleActivity)
      }
    }
  }, [handleActivity])

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
    if (volume < 30) return <Volume className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
    if (volume < 70) return <Volume1 className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
    return <Volume2 className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
  }

  const isLastInCycle = currentProgram ? cycleInfo.current === SCHEDULE.length : false

  return (
    <div className="relative flex items-center justify-center bg-zinc-950 min-h-screen w-full overflow-hidden">
      <div className="w-full md:w-[70vw] md:max-w-[1400px]">
        <div 
          ref={playerRef}
          className="relative w-full aspect-video rounded-t-lg bg-black overflow-hidden shadow-2xl"
        >
          {/* YouTube iframe container */}
          <div ref={youtubeContainerRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 w-full h-full pointer-events-auto" />
          
          {/* START SCREEN */}
          {showStartScreen && !isLoading && (
            <StartScreen onPlayClick={fetchAndStartVideo} />
          )}
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-40">
              <div className="text-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Loading your broadcast...</p>
                <p className="text-white/60 text-sm mt-2">Fetching latest schedule</p>
              </div>
            </div>
          )}
          
          {/* Error overlay */}
          {apiError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-40">
              <div className="text-center max-w-md px-6">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">Failed to Load</p>
                <p className="text-white/60 text-sm mb-6">{apiError}</p>
                <Button onClick={handleReload} className="bg-primary hover:bg-primary/90 text-white">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Player UI - Shows after successful API call */}
          {!showStartScreen && !isLoading && !apiError && playerReady && currentProgram && (
            <>
              {/* TOP-RIGHT LIVE BADGE */}
              <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-40`}>
                <LiveBadge isMobile={isMobile} />
              </div>

              {/* TIME REMAINING - Shows live countdown */}
              {timeRemaining && (
                <div className={`absolute ${isMobile ? 'top-2 left-2' : 'top-4 left-4'} z-40`}>
                  <div className="flex items-center gap-1 bg-zinc-900/80 text-white px-2 py-1 rounded-full text-xs border border-white/10 backdrop-blur-sm">
                    <Clock className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} text-primary`} />
                    <span className={isMobile ? 'text-[10px]' : 'text-xs'}>Next in {timeRemaining}</span>
                  </div>
                </div>
              )}

              {/* BOTTOM TICKER - Shows all items with live countdown */}
              {showTicker && (
                <div className="absolute bottom-0 left-0 right-0 z-30">
                  <div className={`relative overflow-hidden bg-gradient-to-r from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-lg border-t border-white/10 ${
                    isMobile ? 'h-16' : 'h-16'
                  }`}>
                    <div className="relative h-full flex items-center px-2 sm:px-4">
                      {/* Left section with current program info */}
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <LiveBadge variant="transparent" isMobile={isMobile} />
                        
                        {/* Program title and category - visible on desktop */}
                        {!isMobile && (
                          <div className="flex flex-col min-w-[200px] max-w-[300px]">
                            <p className="text-white font-bold text-xs sm:text-sm line-clamp-1">
                              {currentProgram.title}
                            </p>
                            <p className="text-white/60 text-[10px] sm:text-xs">
                              {currentProgram.category || 'Program'} • {cycleInfo.current}/{cycleInfo.total}
                            </p>
                          </div>
                        )}

                        {/* Current time / duration - ALWAYS VISIBLE with live countdown */}
                        <div className={`flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                          <Clock className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'} text-primary`} />
                          <span className="text-white font-semibold whitespace-nowrap">
                            {displayTime} / {formatTime(currentProgram.duration)}
                          </span>
                        </div>
                      </div>

                      {/* Separator */}
                      <div className="h-6 sm:h-8 w-px bg-white/20 mx-2 sm:mx-3 flex-shrink-0" />

                      {/* Scrolling upcoming videos - SHOWS ALL ITEMS */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <ScrollingUpcomingVideos 
                          videos={upcomingVideos} 
                          currentIndex={cycleInfo.current - 1}
                          isMobile={isMobile}
                          isFullscreen={false}
                        />
                      </div>

                      {/* Next program badge - desktop only */}
                      {nextProgram && !isMobile && (
                        <div className="hidden lg:flex items-center gap-2 px-3 flex-shrink-0">
                          <ArrowRight className="text-primary animate-pulse h-3 w-3" />
                          <div className="flex flex-col">
                            <p className="text-white/60 uppercase tracking-wider text-[10px] font-semibold">
                              Up Next
                            </p>
                            <p className="text-white font-semibold text-xs line-clamp-1 max-w-[200px]">
                              {nextProgram.title}
                              {isLastInCycle && <span className="text-primary ml-1">↻</span>}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Controls */}
              <AnimatePresence>
                {controlsVisible && showControls && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute ${showTicker ? 'bottom-16' : 'bottom-0'} left-0 right-0 z-50`}
                  >
                    <div className="bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-transparent pt-4 sm:pt-8">
                      <div className="bg-zinc-900/90 backdrop-blur-md border-t border-zinc-700/50 px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                          {/* Volume */}
                          <div className={`flex items-center gap-1 sm:gap-3 flex-1 ${isMobile ? 'max-w-[100px]' : 'max-w-xs'}`}>
                            <Button variant="ghost" size="icon" onClick={toggleMute} 
                              className={`text-white hover:bg-white/10 ${isMobile ? 'h-6 w-6' : 'h-8 w-8 sm:h-10 sm:w-10'}`}>
                              {getVolumeIcon()}
                            </Button>
                            <div className="flex-1 relative">
                              {showVolumeTooltip && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white ${isMobile ? 'text-[10px] px-1 py-0.5' : 'text-xs px-2 py-1'} rounded`}>
                                  {volume}%
                                </motion.div>
                              )}
                              <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={1} />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setShowTicker(!showTicker)} 
                              className={`text-white hover:bg-white/10 ${isMobile ? 'h-6 w-6' : 'h-8 w-8 sm:h-10 sm:w-10'}`}>
                              {showTicker ? <EyeOff className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} /> : <Eye className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onChannelSwitcherOpen} 
                              className={`text-white hover:bg-white/10 ${isMobile ? 'h-6 w-6' : 'h-8 w-8 sm:h-10 sm:w-10'}`}>
                              <Tv className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
                            </Button>
                            {/* Reload Button */}
                            <Button variant="ghost" size="icon" onClick={handleReload} 
                              className={`text-white hover:bg-white/10 ${isMobile ? 'h-6 w-6' : 'h-8 w-8 sm:h-10 sm:w-10'}`}
                              title="Reload Player">
                              <RefreshCw className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onMenuOpen} 
                              className={`text-white hover:bg-white/10 ${isMobile ? 'h-6 w-6' : 'h-8 w-8 sm:h-10 sm:w-10'}`}>
                              <MoreHorizontal className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Windowed mode content - Program details below video */}
        {!showStartScreen && !isLoading && !apiError && playerReady && currentProgram && (
          <div className="bg-zinc-900/90 border-b border-zinc-700/50 rounded-b-lg px-4 py-3">
            <h3 className={`text-white font-semibold line-clamp-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
              {currentProgram.title}
            </h3>
            {currentProgram.description && (
              <p className={`text-white/60 mt-1 line-clamp-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {currentProgram.description}
              </p>
            )}
            {/* <div className={`flex items-center gap-4 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <div className="flex items-center gap-2">
                <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary`} />
                <span className="text-white font-semibold">{displayTime} / {formatTime(currentProgram.duration)}</span>
              </div>
              {timeRemaining && (
                <div className="flex items-center gap-2">
                  <ArrowRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary`} />
                  <span className="text-white/80">Next in {timeRemaining}</span>
                </div>
              )}
            </div> */}
          </div>
        )}
      </div>
    </div>
  )
}