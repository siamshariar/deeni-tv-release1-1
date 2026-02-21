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
  getTotalScheduleDuration
} from '@/lib/schedule-utils'
import { useYouTubePlayer, YT_STATE } from '@/hooks/use-youtube-player'

interface SyncedVideoPlayerProps {
  onMenuOpen: () => void
  onChannelSwitcherOpen: () => void
}

// First Time TV Start Screen
const FirstTimeTVStartScreen = ({ onUnmute }: { onUnmute: () => void }) => {
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
        </div>
        
        <h1 className={`font-bold text-white mb-2 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
          Deeni.tv
        </h1>
        
        <p className={`text-white/60 mb-6 md:mb-8 ${isMobile ? 'text-base' : 'text-xl'}`}>
          Your Spiritual TV Experience
        </p>
        
        <Button
          onClick={onUnmute}
          size={isMobile ? "default" : "lg"}
          className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg"
        >
          <Volume2 className={`${isMobile ? 'h-5 w-5 mr-2' : 'h-6 w-6 mr-3'}`} />
          Turn On TV
        </Button>
        
        <p className={`text-white/40 mt-4 md:mt-6 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          Tap to enable sound and start watching
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

// Scrolling Upcoming Videos
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

  const items: string[] = []
  const repeatCount = isMobile ? 2 : 3
  
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
        animate={{ x: [0, -2000] }}
        transition={{ duration: isMobile ? 25 : 35, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} className={`text-primary font-semibold px-2 sm:px-3 ${isMobile && isFullscreen ? 'text-[8px]' : 'text-[10px] sm:text-xs'}`}>
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
  
  // Display State - ALL CALCULATED, NOT FROM API
  const [currentProgram, setCurrentProgram] = useState<VideoProgram | null>(null)
  const [nextProgram, setNextProgram] = useState<VideoProgram | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState('0:00')
  const [displayTime, setDisplayTime] = useState('0:00')
  const [cycleInfo, setCycleInfo] = useState({ current: 1, total: SCHEDULE.length })
  const [upcomingVideos, setUpcomingVideos] = useState<VideoProgram[]>([])
  
  // Player State
  const [isLoading, setIsLoading] = useState(true)
  const [playerReady, setPlayerReady] = useState(false)
  const [showFirstTimeScreen, setShowFirstTimeScreen] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  
  // Refs - CRITICAL for stable playback
  const playerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const openMenuAfterExitRef = useRef(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const lastVideoIdRef = useRef<string>('')
  
  // Sync refs - NO API DEPENDENCY
  const masterEpochRef = useRef<number>(MASTER_EPOCH_START)
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // YouTube player hook
  const { 
    containerRef: youtubeContainerRef, 
    initializePlayer, 
    loadVideo, 
    setVolume: setYouTubeVolume,
    setMuted: setYouTubeMuted,
    play,
    destroy
  } = useYouTubePlayer()

  /**
   * PURE CALCULATION - NO API CALLS
   * This runs every 100ms and determines what should be playing
   */
  const updateFromMasterEpoch = useCallback(() => {
    const now = Date.now()
    const totalDuration = getTotalScheduleDuration()
    
    // Calculate position from master epoch
    const elapsedSinceEpoch = Math.floor((now - masterEpochRef.current) / 1000)
    const cyclePosition = elapsedSinceEpoch % totalDuration
    
    // Find current program
    let accumulatedTime = 0
    let foundProgram = SCHEDULE[0]
    let foundTime = 0
    let foundIndex = 0
    
    for (let i = 0; i < SCHEDULE.length; i++) {
      const program = SCHEDULE[i]
      if (cyclePosition >= accumulatedTime && cyclePosition < accumulatedTime + program.duration) {
        foundProgram = program
        foundTime = cyclePosition - accumulatedTime
        foundIndex = i
        break
      }
      accumulatedTime += program.duration
    }
    
    const nextIndex = (foundIndex + 1) % SCHEDULE.length
    const remaining = foundProgram.duration - foundTime
    
    // Update state
    setCurrentProgram(foundProgram)
    setNextProgram(SCHEDULE[nextIndex])
    setCurrentTime(foundTime)
    setDisplayTime(formatTime(foundTime))
    setTimeRemaining(formatTime(remaining))
    setCycleInfo({ current: foundIndex + 1, total: SCHEDULE.length })
    
    // Update upcoming list (next 10 programs)
    const upcoming: VideoProgram[] = []
    for (let i = 1; i <= 10; i++) {
      upcoming.push(SCHEDULE[(foundIndex + i) % SCHEDULE.length])
    }
    setUpcomingVideos(upcoming)
    
    return { foundProgram, foundTime, foundIndex, remaining }
  }, [])

  /**
   * Check if we need to switch videos
   */
  const checkAndSwitchVideo = useCallback(() => {
    if (!playerReady) return
    
    const { foundProgram, foundTime } = updateFromMasterEpoch()
    
    // If program changed, load new video
    if (lastVideoIdRef.current !== foundProgram.videoId) {
      console.log('🔄 Switching to:', foundProgram.title)
      loadVideo(foundProgram.videoId, Math.floor(foundTime))
      lastVideoIdRef.current = foundProgram.videoId
    }
  }, [playerReady, loadVideo, updateFromMasterEpoch])

  /**
   * Initialize player - ONCE
   */
  const initializePlayerOnce = useCallback(async () => {
    setIsLoading(true)
    
    // Get initial position
    const { foundProgram, foundTime } = updateFromMasterEpoch()
    lastVideoIdRef.current = foundProgram.videoId
    
    await initializePlayer({
      videoId: foundProgram.videoId,
      startSeconds: Math.floor(foundTime),
      volume: volume,
      muted: true,
      onReady: () => {
        setPlayerReady(true)
        setIsLoading(false)
        setShowFirstTimeScreen(true)
      },
      onStateChange: (state) => {
        if (state === YT_STATE.ENDED) {
          // Video ended - force recalc and switch
          checkAndSwitchVideo()
        }
      },
      onError: (code, msg) => {
        console.error('Player error:', code, msg)
        setIsLoading(false)
      }
    })
  }, [initializePlayer, volume, updateFromMasterEpoch, checkAndSwitchVideo])

  /**
   * Handle first time unmute
   */
  const handleFirstTimeStart = useCallback(() => {
    setShowFirstTimeScreen(false)
    setHasInteracted(true)
    setIsMuted(false)
    setYouTubeMuted(false)
    setYouTubeVolume(volume)
    play()
  }, [setYouTubeMuted, setYouTubeVolume, volume, play])

  /**
   * TIME UPDATE INTERVAL - Runs every 100ms
   * This is the heart of the sync system
   */
  useEffect(() => {
    if (!playerReady) return
    
    // Update display every 100ms
    timeUpdateIntervalRef.current = setInterval(() => {
      updateFromMasterEpoch()
    }, 100)
    
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current)
      }
    }
  }, [playerReady, updateFromMasterEpoch])

  /**
   * TRANSITION CHECK - Runs every second
   * Checks if we need to switch videos
   */
  useEffect(() => {
    if (!playerReady) return
    
    transitionTimerRef.current = setInterval(() => {
      checkAndSwitchVideo()
    }, 1000)
    
    return () => {
      if (transitionTimerRef.current) {
        clearInterval(transitionTimerRef.current)
      }
    }
  }, [playerReady, checkAndSwitchVideo])

  /**
   * INITIALIZATION - Runs once
   */
  useEffect(() => {
    initializePlayerOnce()
    
    return () => {
      destroy()
    }
  }, [initializePlayerOnce, destroy])

  /**
   * Volume handlers - DIRECT IFRAME CONTROL
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

  // Fullscreen handler
  const handleFullscreen = async () => {
    if (!playerRef.current) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setForceRotate(false)
      } else {
        await playerRef.current.requestFullscreen()
        setControlsVisible(true)
        setShowControls(true)
      }
    } catch (err) {
      setForceRotate(true)
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
      if (!isFs && openMenuAfterExitRef.current) {
        openMenuAfterExitRef.current = false
        onMenuOpen()
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
          className={`relative w-full ${isFullscreen ? 'h-screen max-w-none' : 'aspect-video rounded-t-lg'} bg-black overflow-hidden shadow-2xl`}
        >
          {/* YouTube iframe */}
          <div ref={youtubeContainerRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 w-full h-full pointer-events-auto" />
          
          {/* First Time Screen */}
          {showFirstTimeScreen && playerReady && (
            <FirstTimeTVStartScreen onUnmute={handleFirstTimeStart} />
          )}
          
          {/* Loading */}
          {isLoading && !playerReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
              <div className="text-center">
                <Loader2 className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} text-primary animate-spin mx-auto mb-4`} />
                <p className={`text-white ${isMobile ? 'text-base' : 'text-lg'}`}>Loading broadcast...</p>
              </div>
            </div>
          )}

          {/* LIVE Badge */}
          {playerReady && !showFirstTimeScreen && (
            <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-40`}>
              <LiveBadge isMobile={isMobile} />
            </div>
          )}

          {/* Time Remaining */}
          {/* {timeRemaining && playerReady && !showFirstTimeScreen && (
            <div className={`absolute ${isMobile ? 'top-2 left-2' : 'top-4 left-4'} z-40`}>
              <div className="flex items-center gap-1 bg-zinc-900/80 text-white px-2 py-1 rounded-full text-xs border border-white/10 backdrop-blur-sm">
                <Clock className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} text-primary`} />
                <span className={isMobile ? 'text-[10px]' : 'text-xs'}>Next in {timeRemaining}</span>
              </div>
            </div>
          )} */}

          {/* Ticker */}
          {showTicker && currentProgram && playerReady && !showFirstTimeScreen && (
            <div className="absolute bottom-0 left-0 right-0 z-30">
              <div className={`relative overflow-hidden bg-gradient-to-r from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-lg border-t border-white/10 ${
                isFullscreen ? (isMobile ? 'h-16' : 'h-16') : (isMobile ? 'h-14' : 'h-14')
              }`}>
                <div className="relative h-full flex items-center px-1 sm:px-2 md:px-4">
                  {/* Left section */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <LiveBadge variant="transparent" isMobile={isMobile} />
                    
                    {!isMobile && (
                      <div className="flex-col hidden md:flex">
                        <p className="text-white font-bold text-xs sm:text-sm line-clamp-1 max-w-[200px] lg:max-w-[300px]">
                          {currentProgram.title}
                        </p>
                        <p className="text-white/60 text-[10px] sm:text-xs">
                          {currentProgram.category || 'Program'} • {cycleInfo.current}/{cycleInfo.total}
                        </p>
                      </div>
                    )}

                    <div className={`flex items-center gap-1 px-1 py-0.5 bg-white/10 rounded-full ${isMobile ? 'text-[8px]' : 'text-[10px] sm:text-xs'}`}>
                      <Clock className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} text-primary`} />
                      <span className="text-white font-semibold whitespace-nowrap">
                        {displayTime} / {formatTime(currentProgram.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Separator */}
                  {(!isMobile || !isFullscreen) && (
                    <div className="h-4 sm:h-6 w-px bg-white/20 mx-1 sm:mx-2 flex-shrink-0" />
                  )}

                  {/* Scrolling upcoming */}
                  <div className={`flex-1 min-w-0 overflow-hidden ${isMobile && isFullscreen ? 'hidden' : 'block'}`}>
                    <ScrollingUpcomingVideos 
                      videos={upcomingVideos} 
                      currentIndex={cycleInfo.current - 1}
                      isMobile={isMobile}
                      isFullscreen={isFullscreen}
                    />
                  </div>

                  {/* Next program - desktop only */}
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

          {/* Fullscreen Controls */}
          {isFullscreen && playerReady && !showFirstTimeScreen && (
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
                          <Button variant="ghost" size="icon" onClick={handleFullscreen} 
                            className={`text-white hover:bg-white/10 ${isMobile ? 'h-6 w-6' : 'h-8 w-8 sm:h-10 sm:w-10'}`}>
                            <Minimize className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleMenuOpen} 
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
          )}
        </div>

        {/* Windowed mode content */}
        {!isFullscreen && currentProgram && playerReady && !showFirstTimeScreen && (
          <>
            {/* <div className="bg-zinc-900/90 border-b border-zinc-700/50 rounded-b-lg px-3 sm:px-4 py-2 sm:py-3">
              <h3 className={`text-white font-semibold line-clamp-2 ${isMobile ? 'text-sm' : 'text-base sm:text-lg'}`}>
                {currentProgram.title}
              </h3>
              {currentProgram.description && (
                <p className={`text-white/60 mt-1 line-clamp-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {currentProgram.description}
                </p>
              )}
              <div className={`flex items-center gap-2 sm:gap-4 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary`} />
                  <span className="text-white font-semibold">{displayTime} / {formatTime(currentProgram.duration)}</span>
                </div>
                {timeRemaining && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <ArrowRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-primary`} />
                    <span className="text-white/80">Next in {timeRemaining}</span>
                  </div>
                )}
              </div>
            </div> */}

            {/* Windowed controls */}
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-b-lg px-2 sm:px-4 py-1 sm:py-2">
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                <div className={`flex items-center gap-1 sm:gap-2 flex-1 ${isMobile ? 'max-w-[80px]' : 'max-w-xs'}`}>
                  <Button variant="ghost" size="icon" onClick={toggleMute} 
                    className={`text-white hover:bg-white/10 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}>
                    {getVolumeIcon()}
                  </Button>
                  <div className="hidden sm:block flex-1">
                    <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={1} />
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <div className={`flex items-center gap-1 px-1 sm:px-2 py-0.5 sm:py-1 bg-red-600/20 border border-red-500/30 rounded-full ${isMobile ? 'text-[8px]' : 'text-[10px] sm:text-xs'}`}>
                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                      <span className="animate-ping absolute bg-red-500 rounded-full"></span>
                      <span className="relative bg-red-500 rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2"></span>
                    </span>
                    <span className="text-red-100 font-medium uppercase">LIVE</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setShowTicker(!showTicker)} 
                    className={`text-white hover:bg-white/10 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}>
                    {showTicker ? <EyeOff className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} /> : <Eye className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onChannelSwitcherOpen} 
                    className={`text-white hover:bg-white/10 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}>
                    <Tv className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleFullscreen} 
                    className={`text-white hover:bg-white/10 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}>
                    <Maximize className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleMenuOpen} 
                    className={`text-white hover:bg-white/10 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}>
                    <MoreHorizontal className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
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