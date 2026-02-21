'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Volume2, VolumeX, Maximize, MoreHorizontal, Minimize, 
  Tv, Clock, ArrowRight, Eye, EyeOff, Repeat, Volume1, 
  Volume, AlertCircle, RefreshCw, Play, Loader2, Radio,
  WifiOff
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
  getFallbackVideo
} from '@/lib/schedule-utils'
import { useYouTubePlayer, YT_STATE } from '@/hooks/use-youtube-player'
import { schedulingService } from '@/lib/scheduling-service'

interface SyncedVideoPlayerProps {
  onMenuOpen: () => void
  onChannelSwitcherOpen: () => void
}

// First Time TV Start Screen Component
const FirstTimeTVStartScreen = ({ onUnmute }: { onUnmute: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="relative mb-8">
          <Radio className="h-24 w-24 text-primary mx-auto" />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
          />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">Deeni.tv</h1>
        <p className="text-white/60 text-lg mb-8">Your Spiritual TV Experience</p>
        
        <Button
          onClick={onUnmute}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full"
        >
          <Volume2 className="h-6 w-6 mr-3" />
          Turn On TV
        </Button>
        
        <p className="text-white/40 text-sm mt-6">
          Tap to enable sound and start watching
        </p>
      </motion.div>
    </motion.div>
  )
}

// Error Screen Component
const ErrorScreen = ({ error, onRetry, networkStatus }: { error: string, onRetry: () => void, networkStatus: string }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
      <div className="text-center max-w-md px-6">
        {networkStatus === 'offline' ? (
          <WifiOff className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        ) : (
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        )}
        <p className="text-white text-lg mb-2">
          {networkStatus === 'offline' ? 'Offline' : 'Playback Error'}
        </p>
        <p className="text-white/60 text-sm mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={onRetry}
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={networkStatus === 'offline'}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Reload Page
          </Button>
        </div>
        {networkStatus === 'offline' && (
          <p className="text-white/40 text-xs mt-4">
            Please check your internet connection
          </p>
        )}
      </div>
    </div>
  )
}

// Live Badge Component
const LiveBadge = ({ variant = 'default' }: { variant?: 'default' | 'transparent' }) => {
  if (variant === 'transparent') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">LIVE</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs border border-green-500/30">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute bg-green-500 rounded-full"></span>
        <span className="relative bg-green-500 rounded-full h-2 w-2"></span>
      </span>
      <span>Live</span>
    </div>
  )
}

// Scrolling Upcoming Videos Component
const ScrollingUpcomingVideos = ({ videos, currentIndex }: { videos: VideoProgram[], currentIndex: number }) => {
  if (videos.length === 0) {
    return (
      <div className="relative flex overflow-hidden h-full items-center">
        <motion.div 
          animate={{ x: [0, -500] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap"
        >
          <span className="text-primary font-semibold px-2 text-xs">
            More content coming...
          </span>
        </motion.div>
      </div>
    )
  }

  const items: string[] = []
  const repeatCount = 3
  
  for (let i = 0; i < repeatCount; i++) {
    videos.forEach((video, index) => {
      const isFirstInNextCycle = index === 0 && currentIndex === SCHEDULE.length - 1
      if (index === 0) {
        items.push(`NEXT: ${video.title} • ${formatTime(video.duration)} ${isFirstInNextCycle ? '↻' : ''}`)
      } else {
        items.push(`UP NEXT: ${video.title} • ${formatTime(video.duration)}`)
      }
    })
  }

  return (
    <div className="relative flex overflow-hidden h-full items-center">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -2000] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} className="text-primary font-semibold px-3 text-xs">
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
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(75)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false)
  const [forceRotate, setForceRotate] = useState(false)
  const [showTicker, setShowTicker] = useState(true)
  const [controlsVisible, setControlsVisible] = useState(true)
  
  // Player State
  const [currentData, setCurrentData] = useState<CurrentVideoData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('syncing')
  const [usingFallback, setUsingFallback] = useState(false)
  const [showFirstTimeScreen, setShowFirstTimeScreen] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  
  // Display State
  const [currentTime, setCurrentTime] = useState(0)
  const [upcomingVideos, setUpcomingVideos] = useState<VideoProgram[]>([])
  const [cycleInfo, setCycleInfo] = useState<{ current: number; total: number }>({ current: 0, total: 5 })
  const [displayTime, setDisplayTime] = useState('0:00')
  const [displayDuration, setDisplayDuration] = useState('0:00')
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  
  // Refs for stable values
  const playerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const openMenuAfterExitRef = useRef(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (/Mac/.test(navigator.userAgent) && 'ontouchstart' in document)
  
  // Core refs for playback stability
  const mountedRef = useRef(true)
  const currentDataRef = useRef<CurrentVideoData | null>(null)
  const lastVideoIdRef = useRef<string>('')
  const masterEpochRef = useRef<number>(MASTER_EPOCH_START)
  const serverTimeOffsetRef = useRef<number>(0)
  const nextVideoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isTransitioningRef = useRef(false)
  const apiCallInProgressRef = useRef(false)
  const lastApiCallRef = useRef(0)
  const scheduleVersionRef = useRef('1.0.0')
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Use YouTube player hook
  const { 
    containerRef: youtubeContainerRef, 
    initializePlayer, 
    loadVideo, 
    setVolume: setYouTubeVolume,
    setMuted: setYouTubeMuted,
    seekTo,
    getCurrentTime,
    play,
    isReady,
    destroy
  } = useYouTubePlayer()

  /**
   * Calculate exact playback time using master epoch
   */
  const calculateExactPlaybackTime = useCallback((): { 
    videoId: string, 
    currentTime: number,
    programIndex: number,
    timeRemaining: number,
    nextProgramIndex: number,
    nextProgramStartTime: number
  } => {
    const now = Date.now() + serverTimeOffsetRef.current
    const totalDuration = getTotalScheduleDuration()
    
    const elapsedSinceEpoch = Math.floor((now - masterEpochRef.current) / 1000)
    const cyclePosition = elapsedSinceEpoch % totalDuration
    
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
    
    const currentCycleStart = masterEpochRef.current + 
      Math.floor((now - masterEpochRef.current) / totalDuration / 1000) * totalDuration * 1000
    
    const nextProgramStartTime = currentCycleStart + 
      (accumulatedTime + currentProgram.duration) * 1000
    
    return {
      videoId: currentProgram.videoId,
      currentTime,
      timeRemaining: currentProgram.duration - currentTime,
      programIndex,
      nextProgramIndex: (programIndex + 1) % SCHEDULE.length,
      nextProgramStartTime
    }
  }, [])

  /**
   * Force perfect sync - called every second
   */
  const forcePerfectSync = useCallback(() => {
    if (!playerReady || !mountedRef.current || isTransitioningRef.current) return
    
    const exactTime = calculateExactPlaybackTime()
    const currentVideoId = lastVideoIdRef.current

    if (currentVideoId !== exactTime.videoId) {
      console.log('🔄 Sync: switching to', exactTime.videoId, 'at', exactTime.currentTime.toFixed(2))
      loadVideo(exactTime.videoId, Math.floor(exactTime.currentTime))
      lastVideoIdRef.current = exactTime.videoId
      return
    }

    const playerTime = getCurrentTime() || 0
    const drift = Math.abs(playerTime - exactTime.currentTime)
    
    if (drift > 0.3) {
      console.log(`🎯 Sync: correcting drift ${drift.toFixed(3)}s to ${exactTime.currentTime.toFixed(3)}s`)
      seekTo(exactTime.currentTime, true)
    }
  }, [playerReady, calculateExactPlaybackTime, loadVideo, getCurrentTime, seekTo])

  /**
   * Handle program switch
   */
  const handleProgramSwitch = useCallback((programId: string) => {
    console.log(`🔄 Switching to program ${programId}`)
    transitionToNextVideo()
  }, [])

  /**
   * Throttled fetch current video
   */
  const fetchCurrentVideo = useCallback(async (force = false) => {
    if (apiCallInProgressRef.current) return null
    
    const now = Date.now()
    if (!force && now - lastApiCallRef.current < 30000) {
      return null
    }
    
    apiCallInProgressRef.current = true
    lastApiCallRef.current = now
    
    try {
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
      
      if (result.success && result.data && mountedRef.current) {
        serverTimeOffsetRef.current = result.serverTimestamp - clientTime
        
        if (result.data.masterEpoch) {
          masterEpochRef.current = result.data.masterEpoch
        }
        
        if (result.data.scheduleVersion && result.data.scheduleVersion !== scheduleVersionRef.current) {
          scheduleVersionRef.current = result.data.scheduleVersion
          return { ...result.data, versionChanged: true }
        }
        
        return result.data
      }
    } catch (error) {
      console.error('Error fetching current video:', error)
    } finally {
      apiCallInProgressRef.current = false
    }
    return null
  }, [])

  /**
   * Fetch upcoming videos
   */
  const fetchUpcomingVideos = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && now - lastApiCallRef.current < 60000) {
      return
    }
    
    try {
      const response = await fetch('/api/upcoming-videos?count=15', {
        headers: { 
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success && mountedRef.current) {
        setUpcomingVideos(result.data.upcoming)
      }
    } catch (err) {
      console.error('Error fetching upcoming:', err)
    }
  }, [])

  /**
   * Handle first time TV start
   */
  const handleFirstTimeStart = useCallback(() => {
    console.log('🎬 First time start - unmuting')
    setShowFirstTimeScreen(false)
    setHasInteracted(true)
    setIsMuted(false)
    // Direct YouTube iframe unmute
    setYouTubeMuted(false)
    setYouTubeVolume(volume)
    play()
  }, [setYouTubeMuted, setYouTubeVolume, volume, play])

  /**
   * Handle video transition
   */
  const transitionToNextVideo = useCallback(async () => {
    if (isTransitioningRef.current || !playerReady || !mountedRef.current) return
    
    isTransitioningRef.current = true
    
    try {
      const exactTime = calculateExactPlaybackTime()
      const nextProgram = SCHEDULE[exactTime.nextProgramIndex]
      
      console.log('🔄 Seamless transition to:', nextProgram.title)
      
      if (loadVideo(nextProgram.videoId, 0)) {
        lastVideoIdRef.current = nextProgram.videoId
        
        const newData: CurrentVideoData = {
          program: nextProgram,
          currentTime: 0,
          timeRemaining: nextProgram.duration,
          nextProgram: SCHEDULE[(exactTime.nextProgramIndex + 1) % SCHEDULE.length],
          serverTime: Date.now(),
          programIndex: exactTime.nextProgramIndex,
          epochStart: masterEpochRef.current,
          nextProgramStartTime: exactTime.nextProgramStartTime + nextProgram.duration * 1000
        }
        
        setCurrentData(newData)
        currentDataRef.current = newData
        
        setCycleInfo({
          current: exactTime.nextProgramIndex + 1,
          total: SCHEDULE.length
        })
        
        setDisplayTime('0:00')
        setDisplayDuration(formatTime(nextProgram.duration))
        
        // Preserve mute/volume state after transition
        setTimeout(() => {
          if (!isMuted) {
            console.log('🔊 Restoring unmuted state after transition')
            setYouTubeMuted(false)
            setYouTubeVolume(volume)
          } else {
            console.log('🔇 Restoring muted state after transition')
            setYouTubeMuted(true)
          }
        }, 500)
        
        setTimeout(() => fetchUpcomingVideos(true), 1000)
      }
    } catch (err) {
      console.error('Error during transition:', err)
    } finally {
      isTransitioningRef.current = false
    }
  }, [playerReady, calculateExactPlaybackTime, loadVideo, fetchUpcomingVideos, isMuted, volume, setYouTubeMuted, setYouTubeVolume])

  /**
   * Handle retry on error
   */
  const handleRetry = useCallback(() => {
    setSyncError(null)
    setIsLoading(true)
    
    destroy()
    
    setTimeout(() => {
      if (mountedRef.current) {
        initializePlayerWithCurrentVideo()
      }
    }, 1000)
  }, [destroy])

  /**
   * Initialize player
   */
  const initializePlayerWithCurrentVideo = useCallback(async () => {
    if (!mountedRef.current) return
    
    setIsLoading(true)
    
    try {
      await fetchCurrentVideo(true)
      
      if (!mountedRef.current) return
      
      const exactTime = calculateExactPlaybackTime()
      const currentProgram = SCHEDULE[exactTime.programIndex]
      
      console.log('🎬 Initializing at exact time:', exactTime.currentTime.toFixed(2), 'seconds')
      console.log('Program:', exactTime.programIndex + 1, 'of', SCHEDULE.length)
      
      setCurrentTime(exactTime.currentTime)
      setDisplayTime(formatTime(exactTime.currentTime))
      setDisplayDuration(formatTime(currentProgram.duration))
      setCycleInfo({
        current: exactTime.programIndex + 1,
        total: SCHEDULE.length
      })
      
      await fetchUpcomingVideos(true)
      
      if (!mountedRef.current) return
      
      const data: CurrentVideoData = {
        program: currentProgram,
        currentTime: exactTime.currentTime,
        timeRemaining: exactTime.timeRemaining,
        nextProgram: SCHEDULE[exactTime.nextProgramIndex],
        serverTime: Date.now(),
        programIndex: exactTime.programIndex,
        epochStart: masterEpochRef.current,
        nextProgramStartTime: exactTime.nextProgramStartTime
      }
      
      setCurrentData(data)
      currentDataRef.current = data
      lastVideoIdRef.current = exactTime.videoId
      
      await initializePlayer({
        videoId: exactTime.videoId,
        startSeconds: Math.floor(exactTime.currentTime),
        volume: volume,
        muted: true, // Start muted for autoplay
        onReady: (player) => {
          if (!mountedRef.current) return
          console.log('✅ Player ready')
          setPlayerReady(true)
          setIsLoading(false)
          setSyncError(null)
          setSyncStatus('synced')
          
          // Show first time screen only on initial load
          if (!hasInteracted) {
            console.log('📺 Showing first time screen')
            setShowFirstTimeScreen(true)
            // Ensure player is muted initially
            setYouTubeMuted(true)
          } else {
            // If already interacted, set volume/mute state
            console.log('🔊 Restoring state - isMuted:', isMuted, 'volume:', volume)
            setYouTubeMuted(isMuted)
            setYouTubeVolume(volume)
          }
          
          const timeUntilEnd = exactTime.timeRemaining * 1000
          if (nextVideoTimerRef.current) {
            clearTimeout(nextVideoTimerRef.current)
          }
          
          if (timeUntilEnd > 0) {
            nextVideoTimerRef.current = setTimeout(() => {
              if (mountedRef.current) {
                transitionToNextVideo()
              }
            }, Math.max(0, timeUntilEnd - 100))
          }
        },
        onStateChange: (state) => {
          if (!mountedRef.current) return
          
          if (state === YT_STATE.ENDED) {
            console.log('📺 Video ended - transitioning')
            transitionToNextVideo()
          } else if (state === YT_STATE.PLAYING) {
            const exactTime = calculateExactPlaybackTime()
            setCurrentTime(exactTime.currentTime)
            setDisplayTime(formatTime(exactTime.currentTime))
          }
        },
        onError: (errorCode, errorMessage) => {
          if (!mountedRef.current) return
          console.error('Player error:', errorCode, errorMessage)
          setSyncError(errorMessage)
          setIsLoading(false)
          setPlayerReady(false)
        }
      })
    } catch (err) {
      if (!mountedRef.current) return
      console.error('Error initializing player:', err)
      setSyncError(err instanceof Error ? err.message : 'Failed to initialize player')
      setIsLoading(false)
    }
  }, [fetchCurrentVideo, calculateExactPlaybackTime, fetchUpcomingVideos, initializePlayer, volume, isMuted, hasInteracted, transitionToNextVideo, setYouTubeMuted, setYouTubeVolume])

  /**
   * Set up sync interval
   */
  useEffect(() => {
    if (!playerReady || syncError) return
    
    syncIntervalRef.current = setInterval(() => {
      forcePerfectSync()
    }, 1000)
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [playerReady, syncError, forcePerfectSync])

  /**
   * Set up scheduling service
   */
  useEffect(() => {
    const unsubscribeSwitch = schedulingService.onSwitch(handleProgramSwitch)
    
    return () => {
      unsubscribeSwitch()
      schedulingService.destroy()
    }
  }, [handleProgramSwitch])

  /**
   * Background polling
   */
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (mountedRef.current && navigator.onLine && !apiCallInProgressRef.current && !syncError) {
        const data = await fetchCurrentVideo(false)
        if (data && (data as any).versionChanged) {
          window.location.reload()
        }
      }
    }, 60000)
    
    return () => clearInterval(pollInterval)
  }, [fetchCurrentVideo, syncError])

  /**
   * Initial load
   */
  useEffect(() => {
    mountedRef.current = true
    
    const handleOnline = () => {
      if (syncError) {
        handleRetry()
      }
    }
    
    window.addEventListener('online', handleOnline)
    
    initializePlayerWithCurrentVideo()
    
    return () => {
      mountedRef.current = false
      window.removeEventListener('online', handleOnline)
      if (nextVideoTimerRef.current) {
        clearTimeout(nextVideoTimerRef.current)
      }
      destroy()
    }
  }, [initializePlayerWithCurrentVideo, destroy, handleRetry, syncError])

  /**
   * Time update interval
   */
  useEffect(() => {
    if (!playerReady || !mountedRef.current || syncError) return
    
    const timeInterval = setInterval(() => {
      if (!mountedRef.current) return
      
      const exactTime = calculateExactPlaybackTime()
      
      setCurrentTime(exactTime.currentTime)
      setDisplayTime(formatTime(exactTime.currentTime))
      
      if (currentDataRef.current) {
        const remaining = Math.max(0, Math.floor(currentDataRef.current.timeRemaining))
        if (remaining > 0) {
          const mins = Math.floor(remaining / 60)
          const secs = remaining % 60
          setTimeRemaining(`${mins}:${secs.toString().padStart(2, '0')}`)
        } else {
          setTimeRemaining('0:00')
        }
      }
    }, 100)
    
    return () => clearInterval(timeInterval)
  }, [playerReady, calculateExactPlaybackTime, syncError])

  /**
   * Volume change - DIRECT YOUTUBE IFRAME CONTROL
   */
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setShowVolumeTooltip(true)
    
    // Direct YouTube iframe volume control
    setYouTubeVolume(newVolume)
    
    // If volume > 0 and currently muted, unmute
    if (newVolume > 0 && isMuted) {
      console.log('🔊 Unmuting due to volume change')
      setIsMuted(false)
      setYouTubeMuted(false)
    }
    
    setTimeout(() => setShowVolumeTooltip(false), 1000)
  }, [isMuted, setYouTubeVolume, setYouTubeMuted])

  /**
   * Toggle mute - FIXED: Direct YouTube iframe control with immediate effect
   */
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted
    console.log('🔊 Toggle mute:', newMuted ? 'muting' : 'unmuting')
    
    // Update React state
    setIsMuted(newMuted)
    
    // Direct YouTube iframe mute control - THIS MUST WORK
    setYouTubeMuted(newMuted)
    
    // If unmuting, restore volume
    if (!newMuted) {
      console.log('🔊 Restoring volume to:', volume)
      setYouTubeVolume(volume)
    }
    
    // Force a second call after a tiny delay to ensure it works
    setTimeout(() => {
      setYouTubeMuted(newMuted)
      if (!newMuted) {
        setYouTubeVolume(volume)
      }
    }, 100)
  }, [isMuted, setYouTubeMuted, setYouTubeVolume, volume])

  // UI Handlers
  const handleFullscreen = async () => {
    if (!playerRef.current) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setForceRotate(false)
      } else {
        await playerRef.current.requestFullscreen()
        if (isMobile) {
          try { await (screen as any).orientation?.lock?.('landscape') } catch (err) {}
        }
        setControlsVisible(true)
        setShowControls(true)
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  const handleMenuOpen = useCallback(() => {
    if (document.fullscreenElement) {
      openMenuAfterExitRef.current = true
      document.exitFullscreen()
    } else {
      onMenuOpen()
    }
  }, [onMenuOpen])

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement
      setIsFullscreen(isFs)
      
      if (isFs) {
        setControlsVisible(true)
        setShowControls(true)
        if (playerRef.current) {
          playerRef.current.style.transition = 'none'
          setTimeout(() => {
            if (playerRef.current) {
              playerRef.current.style.transition = ''
            }
          }, 50)
        }
      } else {
        if (openMenuAfterExitRef.current) {
          openMenuAfterExitRef.current = false
          onMenuOpen()
        }
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [onMenuOpen])

  // Activity handlers
  const handleActivity = useCallback(() => {
    if (!isFullscreen) return
    setControlsVisible(true)
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false)
      setShowControls(false)
    }, 3000)
  }, [isFullscreen])

  useEffect(() => {
    if (isFullscreen) {
      const el = playerRef.current
      if (el) {
        el.addEventListener('mousemove', handleActivity)
        el.addEventListener('touchstart', handleActivity)
        return () => {
          el.removeEventListener('mousemove', handleActivity)
          el.removeEventListener('touchstart', handleActivity)
        }
      }
    }
  }, [handleActivity, isFullscreen])

  // Block keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const blocked = [' ', 'Spacebar', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'k', 'j', 'l']
      if (blocked.includes(e.key) || e.code === 'MediaPlayPause') {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [])

  // Get volume icon
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-4 w-4" />
    if (volume < 30) return <Volume className="h-4 w-4" />
    if (volume < 70) return <Volume1 className="h-4 w-4" />
    return <Volume2 className="h-4 w-4" />
  }

  const isLastInCycle = currentData ? (currentData.programIndex ?? 0) === SCHEDULE.length - 1 : false

  return (
    <div className="relative flex items-center justify-center bg-zinc-950 min-h-screen">
      <div className="w-full md:w-[70vw] md:max-w-[1400px]">
        <div 
          ref={playerRef}
          className={`relative w-full ${isFullscreen ? 'h-screen max-w-none' : 'aspect-video rounded-t-lg'} bg-black overflow-hidden shadow-2xl transition-none`}
        >
          {/* YouTube iframe */}
          <div ref={youtubeContainerRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 w-full h-full pointer-events-auto" />
          
          {/* FIRST TIME TV START SCREEN */}
          {showFirstTimeScreen && playerReady && !syncError && (
            <FirstTimeTVStartScreen onUnmute={handleFirstTimeStart} />
          )}
          
          {/* Error Screen */}
          {syncError && (
            <ErrorScreen 
              error={syncError} 
              onRetry={handleRetry} 
              networkStatus={navigator.onLine ? 'online' : 'offline'} 
            />
          )}
          
          {/* Loading */}
          {isLoading && !playerReady && !syncError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
              <div className="text-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Loading broadcast...</p>
              </div>
            </div>
          )}

          {/* TOP-RIGHT LIVE BADGE */}
          {syncStatus === 'synced' && playerReady && !syncError && !showFirstTimeScreen && (
            <div className="absolute top-4 right-4 z-40">
              <LiveBadge />
            </div>
          )}

          {/* TIME REMAINING */}
          {/* {timeRemaining && !syncError && playerReady && !showFirstTimeScreen && (
            <div className="absolute top-4 left-4 z-40">
              <div className="flex items-center gap-2 bg-zinc-900/80 text-white px-3 py-1 rounded-full text-xs border border-white/10 backdrop-blur-sm">
                <Clock className="h-3 w-3 text-primary" />
                <span>Next in {timeRemaining}</span>
              </div>
            </div>
          )} */}

          {/* Ticker */}
          {showTicker && currentData && !syncError && playerReady && !showFirstTimeScreen && (
            <div className="absolute bottom-0 left-0 right-0 z-30">
              <div className={`relative overflow-hidden bg-gradient-to-r from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-lg border-t border-white/10 ${
                isFullscreen ? (isMobile ? 'h-20' : 'h-16') : (isMobile ? 'h-16' : 'h-14')
              }`}>
                <div className="relative h-full flex items-center px-2 sm:px-4">
                  {/* Left: Current Program */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <LiveBadge variant="transparent" />

                    {!isMobile && (
                      <div className="flex flex-col">
                        <p className="text-white font-bold text-xs sm:text-sm line-clamp-1">
                          {currentData.program.title}
                        </p>
                        <p className="text-white/60 text-[10px] sm:text-xs">
                          {currentData.program.category || 'Program'} • {cycleInfo.current}/{cycleInfo.total}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded-full">
                      <Clock className="text-primary h-3 w-3" />
                      <span className="text-white font-semibold text-[10px] sm:text-xs">
                        {displayTime} / {displayDuration}
                      </span>
                    </div>
                  </div>

                  <div className="h-6 sm:h-8 w-px bg-white/20 mx-2 flex-shrink-0" />

                  <div className={`flex-1 min-w-0 overflow-hidden ${isMobile && isFullscreen ? 'hidden' : 'block'}`}>
                    <ScrollingUpcomingVideos 
                      videos={upcomingVideos} 
                      currentIndex={cycleInfo.current - 1}
                    />
                  </div>

                  {currentData.nextProgram && !isMobile && !(isMobile && isFullscreen) && (
                    <div className="flex items-center gap-2 px-3 flex-shrink-0">
                      <ArrowRight className="text-primary animate-pulse h-3 w-3" />
                      <div className="flex flex-col">
                        <p className="text-white/60 uppercase tracking-wider text-[10px] font-semibold">
                          Up Next
                        </p>
                        <p className="text-white font-semibold text-xs line-clamp-1">
                          {currentData.nextProgram.title}
                          {isLastInCycle && <span className="text-primary ml-1">↻</span>}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fullscreen Controls */}
          {isFullscreen && !syncError && playerReady && !showFirstTimeScreen && (
            <AnimatePresence>
              {controlsVisible && showControls && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`absolute ${showTicker ? 'bottom-16' : 'bottom-0'} left-0 right-0 z-50`}
                >
                  <div className="bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-transparent pt-8">
                    <div className="bg-zinc-900/90 backdrop-blur-md border-t border-zinc-700/50 px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        {/* Volume Control - FIXED MUTE FUNCTIONALITY */}
                        <div className="flex items-center gap-3 flex-1 max-w-xs">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={toggleMute} 
                            className="text-white hover:bg-white/10"
                          >
                            {getVolumeIcon()}
                          </Button>
                          <div className="flex-1 relative">
                            {showVolumeTooltip && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded"
                              >
                                {volume}%
                              </motion.div>
                            )}
                            <Slider 
                              value={[volume]} 
                              onValueChange={handleVolumeChange} 
                              max={100} 
                              step={1} 
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setShowTicker(!showTicker)} className="text-white hover:bg-white/10">
                            {showTicker ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={onChannelSwitcherOpen} className="text-white hover:bg-white/10">
                            <Tv className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleFullscreen} className="text-white hover:bg-white/10">
                            <Minimize className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleMenuOpen} className="text-white hover:bg-white/10">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Windowed mode */}
        {!isFullscreen && currentData && !syncError && playerReady && !showFirstTimeScreen && (
          <>
            <div className="bg-zinc-900/90 border-b border-zinc-700/50 rounded-b-lg px-4 py-3">
              <h3 className="text-white text-lg font-semibold line-clamp-2">{currentData.program.title}</h3>
              {currentData.program.description && (
                <p className="text-white/60 text-sm mt-1 line-clamp-2">{currentData.program.description}</p>
              )}
              {/* <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Clock className="text-primary h-4 w-4" />
                  <span className="text-white font-semibold text-sm">
                    {displayTime} / {displayDuration}
                  </span>
                </div>
                {timeRemaining && (
                  <div className="flex items-center gap-2">
                    <ArrowRight className="text-primary h-4 w-4" />
                    <span className="text-white/80 text-sm">
                      Next in {timeRemaining}
                    </span>
                  </div>
                )}
              </div> */}
            </div>

            {/* Windowed Mode Controls - FIXED MUTE FUNCTIONALITY */}
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-b-lg px-4 py-2">
              <div className="flex items-center justify-between gap-2">
                {/* Volume Control */}
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/10">
                    {getVolumeIcon()}
                  </Button>
                  <div className="hidden sm:block flex-1">
                    <Slider 
                      value={[volume]} 
                      onValueChange={handleVolumeChange} 
                      max={100} 
                      step={1} 
                    />
                  </div>
                </div>

                {/* Live Badge */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-600/20 border border-red-500/30 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute bg-red-500 rounded-full"></span>
                      <span className="relative bg-red-500 rounded-full h-2 w-2"></span>
                    </span>
                    <span className="text-red-100 text-xs font-medium uppercase">LIVE</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setShowTicker(!showTicker)} className="text-white hover:bg-white/10">
                    {showTicker ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onChannelSwitcherOpen} className="text-white hover:bg-white/10">
                    <Tv className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleFullscreen} className="text-white hover:bg-white/10">
                    <Maximize className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleMenuOpen} className="text-white hover:bg-white/10">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}