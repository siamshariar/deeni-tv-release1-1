'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Volume2, VolumeX, Maximize, MoreHorizontal, Minimize, 
  Tv, Clock, ArrowRight, Eye, EyeOff, Repeat, Volume1, 
  Volume, AlertCircle, RefreshCw, Play, Loader2, Radio,
  WifiOff, Globe, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useMediaQuery } from '@/hooks/use-media-query'
import { CurrentVideoData, VideoProgram, Channel } from '@/types/schedule'
import { 
  formatTime, 
  CHANNELS, 
  MASTER_EPOCH_START, 
  getTotalScheduleDuration,
  getChannelPrograms,
  getSavedChannel,
  saveChannel,
  STORAGE_KEY
} from '@/lib/schedule-utils'
import { useYouTubePlayer, YT_STATE } from '@/hooks/use-youtube-player'

interface SyncedVideoPlayerProps {
  onMenuOpen: () => void
  initialChannelId?: string
  onChannelChange?: (channelId: string) => void
}

// Channel Selector Modal Component
const ChannelSelectorModal = ({ 
  isOpen, 
  onClose, 
  channels, 
  onSelectChannel, 
  currentChannelId 
}: { 
  isOpen: boolean
  onClose: () => void
  channels: Channel[]
  onSelectChannel: (channelId: string) => void
  currentChannelId?: string
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 z-[70] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Select Channel</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <p className="text-white/60 text-sm mb-4">
                Choose your preferred language and channel
              </p>
              <div className="space-y-2">
                {channels.map((channel) => (
                  <motion.button
                    key={channel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectChannel(channel.id)
                      onClose()
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      channel.id === currentChannelId
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{channel.icon}</span>
                      <div className="text-left">
                        <p className={`font-semibold ${
                          channel.id === currentChannelId ? 'text-primary' : 'text-white'
                        }`}>
                          {channel.name}
                        </p>
                        <p className="text-xs text-white/40">
                          {channel.language} • {channel.programs.length} programs
                        </p>
                      </div>
                    </div>
                    {channel.id === currentChannelId && (
                      <span className="text-primary text-xs font-medium px-2 py-1 bg-primary/20 rounded-full">
                        Current
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Start Screen Component
const StartScreen = ({ onPlayClick }: { onPlayClick: () => void }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
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
      <div className={`flex items-center gap-1 ${isMobile ? 'px-1.5 py-0.5' : 'px-2 py-1'} bg-black/40 backdrop-blur-sm border border-white/20 rounded-full`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute bg-red-500 rounded-full"></span>
          <span className="relative bg-red-500 rounded-full h-2 w-2"></span>
        </span>
        <span className={`text-white font-bold uppercase tracking-wider ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}>LIVE</span>
      </div>
    )
  }
  
  return (
    <div className={`flex items-center gap-2 ${isMobile ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} bg-green-500/20 text-green-300 rounded-full border border-green-500/30`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute bg-green-500 rounded-full"></span>
        <span className="relative bg-green-500 rounded-full h-2 w-2"></span>
      </span>
      <span>Live</span>
    </div>
  )
}

// Desktop Scrolling Upcoming Videos - Full layout
const DesktopScrollingVideos = ({ videos, currentIndex, totalPrograms }: { 
  videos: VideoProgram[], 
  currentIndex: number,
  totalPrograms: number 
}) => {
  if (videos.length === 0) {
    return (
      <div className="relative flex overflow-hidden h-full items-center">
        <motion.div 
          animate={{ x: [0, -500] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap"
        >
          <span className="text-primary font-semibold px-3 text-xs">
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
      const isFirstInNextCycle = index === 0 && currentIndex === totalPrograms - 1
      const prefix = index === 0 ? 'NEXT' : 'UP NEXT'
      const duration = formatTime(video.duration)
      const wrapSymbol = isFirstInNextCycle ? '↻' : ''
      
      let item = `${prefix}: ${video.title} • ${duration}`
      if (wrapSymbol) item += ` ${wrapSymbol}`
      items.push(item)
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
          <span key={i} className="text-primary font-semibold px-4 text-xs">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// Mobile Scrolling Upcoming Videos - Compact layout
const MobileScrollingVideos = ({ videos, currentIndex, totalPrograms }: { 
  videos: VideoProgram[], 
  currentIndex: number,
  totalPrograms: number 
}) => {
  if (videos.length === 0) {
    return (
      <div className="relative flex overflow-hidden h-full items-center">
        <motion.div 
          animate={{ x: [0, -300] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap"
        >
          <span className="text-primary font-semibold px-2 text-[8px]">
            More content coming...
          </span>
        </motion.div>
      </div>
    )
  }

  const items: string[] = []
  const repeatCount = 2
  
  for (let i = 0; i < repeatCount; i++) {
    videos.slice(0, 5).forEach((video, index) => {
      const isFirstInNextCycle = index === 0 && currentIndex === totalPrograms - 1
      const prefix = index === 0 ? 'NEXT' : 'UP NEXT'
      const duration = formatTime(video.duration)
      const wrapSymbol = isFirstInNextCycle ? '↻' : ''
      
      let item = `${prefix}: ${video.title} • ${duration}`
      if (wrapSymbol) item += ` ${wrapSymbol}`
      items.push(item)
    })
  }

  return (
    <div className="relative flex overflow-hidden h-full items-center">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1200] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} className="text-primary font-semibold px-2 text-[8px]">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export function SyncedVideoPlayer({ 
  onMenuOpen, 
  initialChannelId = CHANNELS[0].id,
  onChannelChange 
}: SyncedVideoPlayerProps) {
  // UI State
  const [showControls, setShowControls] = useState(true)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(75)
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false)
  const [showTicker, setShowTicker] = useState(true)
  
  // Channel State
  const [channels] = useState<Channel[]>(CHANNELS)
  const [currentChannelId, setCurrentChannelId] = useState<string>(() => {
    // Use initialChannelId first, then try saved, then default
    if (initialChannelId && CHANNELS.some(c => c.id === initialChannelId)) {
      return initialChannelId
    }
    const saved = getSavedChannel()
    return saved && CHANNELS.some(c => c.id === saved) ? saved : CHANNELS[0].id
  })
  const [showChannelSelector, setShowChannelSelector] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(true)
  
  // Player State
  const [currentProgram, setCurrentProgram] = useState<VideoProgram | null>(null)
  const [nextProgram, setNextProgram] = useState<VideoProgram | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState('0:00')
  const [displayTime, setDisplayTime] = useState('0:00')
  const [cycleInfo, setCycleInfo] = useState({ current: 1, total: 1 })
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

  const updateTimeDisplay = useCallback(() => {
    if (!currentProgram || !currentChannelId) return
    
    const now = Date.now() + serverTimeOffset
    const programs = getChannelPrograms(currentChannelId)
    if (programs.length === 0) return
    
    const totalDuration = programs.reduce((sum, p) => sum + p.duration, 0)
    
    const elapsedSinceEpoch = Math.floor((now - masterEpochRef.current) / 1000)
    const cyclePosition = elapsedSinceEpoch % totalDuration
    
    let accumulatedTime = 0
    let foundTime = 0
    let foundIndex = 0
    
    for (let i = 0; i < programs.length; i++) {
      const program = programs[i]
      if (cyclePosition >= accumulatedTime && cyclePosition < accumulatedTime + program.duration) {
        foundTime = cyclePosition - accumulatedTime
        foundIndex = i
        break
      }
      accumulatedTime += program.duration
    }
    
    setCurrentTime(foundTime)
    setDisplayTime(formatTime(foundTime))
    
    if (currentProgram) {
      const remaining = Math.max(0, currentProgram.duration - foundTime)
      setTimeRemaining(formatTime(remaining))
    }
    
    if (foundIndex + 1 !== cycleInfo.current) {
      setCycleInfo({ current: foundIndex + 1, total: programs.length })
    }
  }, [currentProgram, currentChannelId, serverTimeOffset, cycleInfo.current])

  const loadChannel = useCallback(async (channelId: string) => {
    if (isLoading) return
    
    setIsLoading(true)
    setApiError(null)
    setCurrentChannelId(channelId)
    onChannelChange?.(channelId)
    
    saveChannel(channelId)
    
    try {
      console.log('🎬 Loading channel:', channelId)
      
      const clientTime = Date.now()
      const response = await fetch(`/api/current-video?channel=${channelId}`, {
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
      
      const programs = getChannelPrograms(channelId)
      const upcoming: VideoProgram[] = []
      for (let i = 1; i <= 15; i++) {
        const nextIndex = (result.data.programIndex + i) % programs.length
        upcoming.push(programs[nextIndex])
      }
      setUpcomingVideos(upcoming)
      
      lastVideoIdRef.current = program.videoId
      
      if (playerReady) {
        console.log('🔄 Loading new video in existing player')
        loadVideo(program.videoId, Math.floor(startTime))
        seekTo(startTime, true)
        play()
        setIsLoading(false)
      } else {
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
            setIsFirstTime(false)
            
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
            if (code === 2 || code === 5 || code === 100) {
              setApiError(`Playback error: ${msg}`)
              setIsLoading(false)
            } else {
              console.log('⚠️ Non-critical error, continuing playback')
              setIsLoading(false)
            }
          }
        })
      }
      
    } catch (error) {
      console.error('API call failed:', error)
      setApiError(error instanceof Error ? error.message : 'Failed to load video')
      setIsLoading(false)
    }
  }, [isLoading, playerReady, volume, initializePlayer, loadVideo, seekTo, play, setYouTubeVolume, setYouTubeMuted, onChannelChange])

  const handleFirstTimeStart = useCallback(() => {
    setShowChannelSelector(true)
  }, [])

  const handleSelectChannel = useCallback((channelId: string) => {
    setShowChannelSelector(false)
    loadChannel(channelId)
  }, [loadChannel])

  const handleOpenChannelSelector = useCallback(() => {
    setShowChannelSelector(true)
  }, [])

  const playNextVideo = useCallback(async () => {
    if (!currentProgram || !nextProgram || !currentChannelId) return
    
    console.log('▶️ Playing next video:', nextProgram.title)
    
    const startTime = 0
    
    setCurrentProgram(nextProgram)
    setCurrentTime(startTime)
    setDisplayTime(formatTime(startTime))
    
    const programs = getChannelPrograms(currentChannelId)
    const currentIndex = programs.findIndex(p => p.id === nextProgram.id)
    const nextNextIndex = (currentIndex + 1) % programs.length
    const nextNextProgram = programs[nextNextIndex]
    setNextProgram(nextNextProgram)
    
    setCycleInfo(prev => ({ 
      current: (prev.current % prev.total) + 1, 
      total: prev.total 
    }))
    
    const upcoming: VideoProgram[] = []
    for (let i = 1; i <= 15; i++) {
      upcoming.push(programs[(currentIndex + i) % programs.length])
    }
    setUpcomingVideos(upcoming)
    
    lastVideoIdRef.current = nextProgram.videoId
    loadVideo(nextProgram.videoId, startTime)
    
    setYouTubeVolume(volume)
    setYouTubeMuted(isMuted)
    
  }, [currentProgram, nextProgram, currentChannelId, loadVideo, volume, isMuted, setYouTubeVolume, setYouTubeMuted])

  const syncWithServer = useCallback(async () => {
    if (!playerReady || !mountedRef.current || !currentChannelId) return
    
    try {
      console.log('🔄 Syncing with server (5-minute interval)...')
      
      const response = await fetch(`/api/current-video?channel=${currentChannelId}`, {
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
        
        const programs = getChannelPrograms(currentChannelId)
        const upcoming: VideoProgram[] = []
        for (let i = 1; i <= 15; i++) {
          const nextIndex = (result.data.programIndex + i) % programs.length
          upcoming.push(programs[nextIndex])
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
  }, [playerReady, currentChannelId, currentProgram, loadVideo, seekTo])

  const handleReload = useCallback(() => {
    console.log('🔄 Reloading...')
    setShowStartScreen(true)
    setPlayerReady(false)
    setCurrentProgram(null)
    setCurrentChannelId('')
    setApiError(null)
    setIsFirstTime(true)
    destroy()
    
    setTimeout(() => {
      setShowStartScreen(true)
    }, 100)
  }, [destroy])

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

  useEffect(() => {
    if (!playerReady) return
    
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
    }
    
    syncIntervalRef.current = setInterval(() => {
      syncWithServer()
    }, 300000)
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [playerReady, syncWithServer])

  useEffect(() => {
    const savedChannel = getSavedChannel()
    if (savedChannel && savedChannel !== currentChannelId) {
      loadChannel(savedChannel)
    }
  }, [])

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

  const isLastInCycle = currentProgram && cycleInfo.total ? cycleInfo.current === cycleInfo.total : false

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
          {showStartScreen && !isLoading && !apiError && (
            <StartScreen onPlayClick={handleFirstTimeStart} />
          )}
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-40">
              <div className="text-center">
                <Loader2 className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} text-primary animate-spin mx-auto mb-4`} />
                <p className={`text-white ${isMobile ? 'text-base' : 'text-lg'}`}>Loading your broadcast...</p>
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
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleReload} className="bg-primary hover:bg-primary/90 text-white">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={handleOpenChannelSelector} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Change Channel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Player UI */}
          {!showStartScreen && !isLoading && !apiError && playerReady && currentProgram && (
            <>
              {/* TOP SECTION - Different for desktop vs mobile */}
              {!isMobile ? (
                // DESKTOP TOP SECTION - Full layout
                <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-6 pb-12 px-6">
                  <div className="flex items-center gap-4">
                    <LiveBadge isMobile={false} />
                    <div className="flex-1">
                      <h2 className="text-white font-bold text-lg sm:text-xl line-clamp-1">
                        {currentProgram.title}
                      </h2>
                      <p className="text-white/60 text-xs sm:text-sm mt-1">
                        {currentProgram.category || 'Program'} • {cycleInfo.current}/{cycleInfo.total} • {
                          channels.find(c => c.id === currentChannelId)?.name
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // MOBILE TOP SECTION - Only shown when player is open
                showControls && (
                  <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-3 pb-6 px-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <LiveBadge isMobile={true} />
                        <span className="text-white/60 text-[8px]">
                          {cycleInfo.current}/{cycleInfo.total} • {channels.find(c => c.id === currentChannelId)?.name}
                        </span>
                      </div>
                      <h2 className="text-white font-bold text-xs line-clamp-1">
                        {currentProgram.title}
                      </h2>
                      <p className="text-white/60 text-[8px]">
                        {currentProgram.category || 'Program'}
                      </p>
                    </div>
                  </div>
                )
              )}

              {/* BOTTOM TICKER - Different for desktop vs mobile */}
              {showTicker && (
                <div className="absolute bottom-0 left-0 right-0 z-30">
                  {!isMobile ? (
                    // DESKTOP TICKER - Full layout
                    <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-lg border-t border-white/10 h-16">
                      <div className="relative h-full flex items-center px-6">
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs">
                            <Clock className="h-3 w-3 text-primary" />
                            <span className="text-white font-semibold whitespace-nowrap">
                              {displayTime} / {formatTime(currentProgram.duration)}
                            </span>
                          </div>
                          
                          {timeRemaining && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 rounded-full border border-primary/30 text-xs">
                              <ArrowRight className="h-3 w-3 text-primary" />
                              <span className="text-primary font-semibold whitespace-nowrap">
                                Next in {timeRemaining}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="h-8 w-px bg-white/20 mx-4 flex-shrink-0" />

                        <div className="flex-1 min-w-0 overflow-hidden">
                          <DesktopScrollingVideos 
                            videos={upcomingVideos} 
                            currentIndex={cycleInfo.current - 1}
                            totalPrograms={cycleInfo.total}
                          />
                        </div>

                        {nextProgram && (
                          <div className="hidden lg:flex items-center gap-3 px-4 flex-shrink-0">
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
                  ) : (
                    // MOBILE TICKER - Compact layout (always visible)
                    <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-lg border-t border-white/10 h-12">
                      <div className="relative h-full flex items-center px-2">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
                            <Clock className="h-2.5 w-2.5 text-primary" />
                            <span className="text-white font-semibold text-[9px] whitespace-nowrap">
                              {displayTime}
                            </span>
                          </div>
                          
                          {timeRemaining && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-primary/20 rounded-full border border-primary/30">
                              <ArrowRight className="h-2.5 w-2.5 text-primary" />
                              <span className="text-primary font-semibold text-[9px] whitespace-nowrap">
                                {timeRemaining}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 overflow-hidden ml-2">
                          <MobileScrollingVideos 
                            videos={upcomingVideos} 
                            currentIndex={cycleInfo.current - 1}
                            totalPrograms={cycleInfo.total}
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                    className={`absolute ${showTicker ? (isMobile ? 'bottom-12' : 'bottom-16') : 'bottom-0'} left-0 right-0 z-50`}
                  >
                    <div className="bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-transparent pt-4">
                      <div className={`bg-zinc-900/90 backdrop-blur-md border-t border-zinc-700/50 ${
                        isMobile ? 'px-3 py-2' : 'px-6 py-3'
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          {/* Volume */}
                          <div className={`flex items-center gap-2 flex-1 ${isMobile ? 'max-w-[90px]' : 'max-w-xs'}`}>
                            <Button variant="ghost" size="icon" onClick={toggleMute} 
                              className={`text-white hover:bg-white/10 ${isMobile ? 'h-7 w-7' : 'h-8 w-8'}`}>
                              {getVolumeIcon()}
                            </Button>
                            <div className="flex-1 relative">
                              {showVolumeTooltip && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white ${isMobile ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'} rounded shadow-lg`}>
                                  {volume}%
                                </motion.div>
                              )}
                              <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={1} />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={handleOpenChannelSelector}
                              className={`text-white hover:bg-white/10 ${isMobile ? 'h-7 w-7' : 'h-8 w-8'}`}
                              title="Change Channel">
                              <Globe className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
                            </Button>
                            
                            <Button variant="ghost" size="icon" onClick={() => setShowTicker(!showTicker)} 
                              className={`text-white hover:bg-white/10 ${isMobile ? 'h-7 w-7' : 'h-8 w-8'}`}>
                              {showTicker ? <EyeOff className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} /> : <Eye className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />}
                            </Button>
                            
                            <Button variant="ghost" size="icon" onClick={handleReload} 
                              className={`text-white hover:bg-white/10 ${isMobile ? 'h-7 w-7' : 'h-8 w-8'}`}
                              title="Reload Player">
                              <RefreshCw className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
                            </Button>
                            
                            <Button variant="ghost" size="icon" onClick={onMenuOpen} 
                              className={`text-white hover:bg-white/10 ${isMobile ? 'h-7 w-7' : 'h-8 w-8'}`}>
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

        {/* Windowed mode content - Different for desktop vs mobile */}
        {!showStartScreen && !isLoading && !apiError && playerReady && currentProgram && !isMobile && (
          <div className="bg-zinc-900/90 border-b border-zinc-700/50 rounded-b-lg px-6 py-4">
            <h3 className="text-white font-semibold text-lg line-clamp-2">
              {currentProgram.title}
            </h3>
            {currentProgram.description && (
              <p className="text-white/60 text-sm mt-1 line-clamp-2">
                {currentProgram.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Channel Selector Modal */}
      <ChannelSelectorModal
        isOpen={showChannelSelector}
        onClose={() => setShowChannelSelector(false)}
        channels={channels}
        onSelectChannel={handleSelectChannel}
        currentChannelId={currentChannelId}
      />
    </div>
  )
}