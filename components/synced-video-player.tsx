'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Volume2, VolumeX, Maximize, MoreHorizontal, Minimize, 
  Tv, Clock, ArrowRight, Eye, EyeOff, Repeat, Volume1, 
  Volume, AlertCircle, RefreshCw, Play, Loader2, Radio,
  WifiOff, Globe, X, Smartphone, Tablet, Laptop,
  Sparkles, Zap, Shield, Star, Heart, ChevronRight,
  ChevronLeft, Menu, Home, Settings, Info, Calendar,
  Moon, Sun, Battery, Wifi, Signal, Volume as VolumeIcon,
  ChevronUp, ChevronDown, TrendingUp, Radio as RadioIcon,
  PlayCircle, RefreshCcw, Timer, Hourglass, History
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
  addToPreviousVideos,
  getPreviousVideos,
  STORAGE_KEY
} from '@/lib/schedule-utils'
import { useYouTubePlayer, YT_STATE } from '@/hooks/use-youtube-player'
import { PreviousVideosModal } from './previous-videos-modal'

interface SyncedVideoPlayerProps {
  onMenuOpen: () => void
  initialChannelId?: string
  onChannelChange?: (channelId: string) => void
  showStartModal?: boolean
  onStartClick?: () => void
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
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.language.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60]"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${
              isMobile ? 'max-w-sm' : 'max-w-2xl'
            } bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-2xl shadow-2xl border border-white/10 z-[70] overflow-hidden`}
          >
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 animate-gradient" />
              <div className="relative flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Select Your Channel</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <Globe className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
              </div>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredChannels.map((channel, index) => (
                  <motion.button
                    key={channel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectChannel(channel.id)
                      onClose()
                    }}
                    className={`relative group p-4 rounded-xl border transition-all ${
                      channel.id === currentChannelId
                        ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/50 shadow-lg shadow-primary/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {channel.id === currentChannelId && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-primary/20"
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                    
                    <div className="relative flex items-center gap-3">
                      <div className="text-3xl filter drop-shadow-lg">{channel.icon}</div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold ${
                          channel.id === currentChannelId ? 'text-primary' : 'text-white'
                        }`}>
                          {channel.name}
                        </p>
                        <p className="text-xs text-white/40">
                          {channel.language} • {channel.programs.length} programs
                        </p>
                      </div>
                      {channel.id === currentChannelId && (
                        <div className="px-2 py-1 bg-primary/20 rounded-full">
                          <span className="text-primary text-xs font-medium">Current</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-white/10 bg-white/5">
              <p className="text-center text-xs text-white/40">
                {filteredChannels.length} channels available • Select your preferred language
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Start Screen Component
const StartScreen = ({ onPlayClick }: { onPlayClick: () => void }) => {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-black z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className="w-full h-full flex items-center justify-center"
      >
        <div className={`w-full ${
          isMobile ? 'max-w-sm px-4' : 
          isTablet ? 'max-w-2xl px-6' : 
          'max-w-4xl px-8'
        }`}>
          <div className="text-center">
            <div className="relative mb-8 md:mb-12">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative inline-block"
              >
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                <Radio className={`${
                  isMobile ? 'h-20 w-20' : 
                  isTablet ? 'h-24 w-24' : 
                  'h-32 w-32'
                } text-primary mx-auto relative z-10`} />
                
                <motion.div
                  animate={{ 
                    y: ['-100%', '200%'],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm"
                />
              </motion.div>
            </div>
            
            <motion.h1 
              className={`font-bold text-white mb-2 ${
                isMobile ? 'text-3xl' : 
                isTablet ? 'text-4xl' : 
                'text-5xl'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Deeni
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                .tv
              </span>
            </motion.h1>
            
            <motion.p 
              className={`text-white/60 mb-6 md:mb-8 ${
                isMobile ? 'text-sm' : 
                isTablet ? 'text-base' : 
                'text-lg'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Your Spiritual TV Experience
            </motion.p>
            
            {!isMobile && (
              <motion.div 
                className="flex flex-wrap items-center justify-center gap-2 mb-8 md:mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {[
                  { icon: Zap, text: 'Live TV Experience' },
                  { icon: Shield, text: '100% Halal Content' },
                  { icon: Sparkles, text: 'Premium Quality' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10"
                  >
                    <item.icon className="h-3 w-3 text-primary" />
                    <span className="text-xs text-white/80 whitespace-nowrap">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <Button
                onClick={onPlayClick}
                size="lg"
                className="relative group bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white rounded-full shadow-2xl shadow-primary/30 px-8 py-6 text-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Play className="h-5 w-5 fill-current" />
                  Start Watching
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </Button>
            </motion.div>
            
            <motion.p 
              className="text-white/40 mt-4 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Click to start your spiritual journey
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Live Badge Component
const LiveBadge = ({ variant = 'default', isMobile = false }: { variant?: 'default' | 'transparent', isMobile?: boolean }) => {
  if (variant === 'transparent') {
    return (
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`flex items-center gap-1 ${
          isMobile ? 'px-1.5 py-0.5' : 'px-2 py-1'
        } bg-black/40 backdrop-blur-md border border-white/20 rounded-full shadow-lg`}
      >
        <span className="relative flex h-2 w-2">
          <motion.span
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-red-500"
          />
          <span className="relative inset-0 rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className={`text-white font-bold uppercase tracking-wider ${
          isMobile ? 'text-[8px]' : 'text-[10px]'
        }`}>LIVE</span>
      </motion.div>
    )
  }
  
  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`flex items-center gap-2 ${
        isMobile ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      } bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 rounded-full border border-green-500/30 shadow-lg shadow-green-500/10`}
    >
      <span className="relative flex h-2 w-2">
        <motion.span
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-green-500"
        />
        <span className="relative inset-0 rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span>LIVE</span>
    </motion.div>
  )
}

// Deeni.tv Logo Component
const DeeniLogo = ({ isMobile = false }: { isMobile?: boolean }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center"
    >
      <span className={`font-bold ${
        isMobile ? 'text-base' : 'text-2xl'
      } text-white tracking-tight`}>
        Deeni<span className="text-primary font-bold">.tv</span>
      </span>
    </motion.div>
  )
}

// Desktop Ticker Component - Enhanced bold text, 360-degree infinite scroll
const DesktopTicker = ({ videos, currentIndex, totalPrograms, currentProgramId }: { 
  videos: VideoProgram[], 
  currentIndex: number,
  totalPrograms: number,
  currentProgramId?: string
}) => {
  if (videos.length === 0) {
    return (
      <div className="relative flex overflow-hidden h-full items-center">
        <motion.div 
          animate={{ x: [0, -500] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear", repeatType: "loop" }}
          className="whitespace-nowrap"
        >
          <span className="text-white/90 font-bold px-4 text-sm">
            <RadioIcon className="inline h-3 w-3 mr-2 text-primary animate-pulse" />
            More content coming...
          </span>
        </motion.div>
      </div>
    )
  }

  const items: JSX.Element[] = []
  const repeatCount = 40 // Very high for true 360-degree infinite loop
  
  for (let i = 0; i < repeatCount; i++) {
    videos.forEach((video, index) => {
      const isFirstInNextCycle = index === 0 && currentIndex === totalPrograms - 1
      const isNextVideo = index === 0
      const isCurrentVideo = video.id === currentProgramId
      const prefix = isNextVideo ? 'NEXT' : 'UP NEXT'
      const duration = formatTime(video.duration)
      
      if (isCurrentVideo) return;
      
      items.push(
        <div key={`${video.id}-${i}-${index}`} className="inline-flex items-center mx-5">
          <span className={`
            px-2 py-0.5 rounded-full text-xs font-black mr-3 whitespace-nowrap
            ${isNextVideo 
              ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/70 shadow-lg shadow-yellow-500/30 font-extrabold' 
              : 'bg-white/30 text-white border border-white/40 shadow-lg font-bold'
            }
          `}>
            {prefix}
          </span>
          <span className={`font-black text-sm whitespace-nowrap tracking-wide ${
            isNextVideo ? 'text-yellow-300' : 'text-white'
          }`}>
            {video.title}
          </span>
          <span className={`ml-3 font-mono text-sm font-black whitespace-nowrap ${
            isNextVideo ? 'text-yellow-300' : 'text-white/80'
          }`}>
            {duration}
          </span>
          {isFirstInNextCycle && (
            <RefreshCcw className="h-3 w-3 ml-3 text-primary animate-spin-slow flex-shrink-0" />
          )}
        </div>
      )
    })
  }

  return (
    <div className="relative flex overflow-hidden h-full items-center group">
      {/* Gradient Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black/95 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black/95 to-transparent z-10 pointer-events-none" />
      
      {/* Infinite Scrolling - 360-degree never ends */}
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -20000] }}
        transition={{ 
          duration: 150, 
          repeat: Infinity, 
          ease: "linear",
          repeatType: "loop"
        }}
        style={{ willChange: "transform" }}
      >
        {items}
      </motion.div>
    </div>
  )
}

// Mobile Ticker Component - Enhanced, more items visible
const MobileTicker = ({ videos, currentIndex, totalPrograms, currentProgramId }: { 
  videos: VideoProgram[], 
  currentIndex: number,
  totalPrograms: number,
  currentProgramId?: string
}) => {
  if (videos.length === 0) {
    return (
      <div className="relative flex overflow-hidden h-full items-center">
        <motion.div 
          animate={{ x: [0, -300] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear", repeatType: "loop" }}
          className="whitespace-nowrap"
        >
          <span className="text-white/90 font-bold px-2 text-[10px]">
            More content coming...
          </span>
        </motion.div>
      </div>
    )
  }

  const items: JSX.Element[] = []
  const repeatCount = 30 // Very high for true 360-degree infinite loop
  
  for (let i = 0; i < repeatCount; i++) {
    videos.forEach((video, index) => {
      const isFirstInNextCycle = index === 0 && currentIndex === totalPrograms - 1
      const isNextVideo = index === 0
      const isCurrentVideo = video.id === currentProgramId
      const prefix = isNextVideo ? 'NEXT' : 'UP NEXT'
      const duration = formatTime(video.duration)
      
      if (isCurrentVideo) return;
      
      items.push(
        <div key={`${video.id}-${i}-${index}`} className="inline-flex items-center mx-2">
          <span className={`
            px-1.5 py-0.5 rounded-full text-[9px] font-black mr-1.5 whitespace-nowrap
            ${isNextVideo 
              ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/70 shadow-sm font-extrabold' 
              : 'bg-white/30 text-white border border-white/40 shadow-sm font-bold'
            }
          `}>
            {prefix}
          </span>
          <span className={`font-black text-[11px] whitespace-nowrap tracking-wide ${
            isNextVideo ? 'text-yellow-300' : 'text-white'
          }`}>
            {video.title}
          </span>
          <span className={`ml-1.5 font-mono text-[10px] font-black whitespace-nowrap ${
            isNextVideo ? 'text-yellow-300' : 'text-white/80'
          }`}>
            {duration}
          </span>
          {isFirstInNextCycle && (
            <RefreshCcw className="h-2 w-2 ml-1.5 text-primary animate-spin-slow flex-shrink-0" />
          )}
        </div>
      )
    })
  }

  return (
    <div className="relative flex overflow-hidden h-full items-center">
      {/* Gradient Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-black/95 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-black/95 to-transparent z-10 pointer-events-none" />
      
      {/* Infinite Scrolling - 360-degree never ends */}
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -10000] }}
        transition={{ 
          duration: 100, 
          repeat: Infinity, 
          ease: "linear",
          repeatType: "loop"
        }}
        style={{ willChange: "transform" }}
      >
        {items}
      </motion.div>
    </div>
  )
}

// Modern Time Display Component
const ModernTimeDisplay = () => {
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  const formattedTime = time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  })
  
  const formattedDate = time.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  })
  
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-4 right-4 z-40"
    >
      <div className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-white font-semibold text-sm tracking-wide">
          {formattedTime}
        </span>
        <div className="w-px h-4 bg-white/20" />
        <span className="text-white/80 text-xs font-medium">
          {formattedDate}
        </span>
      </div>
    </motion.div>
  )
}

export function SyncedVideoPlayer({ 
  onMenuOpen, 
  initialChannelId = CHANNELS[0].id,
  onChannelChange,
  showStartModal = false,
  onStartClick
}: SyncedVideoPlayerProps) {
  // UI State
  const [showControls, setShowControls] = useState(true)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(75)
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false)
  const [showTicker, setShowTicker] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPreviousModal, setShowPreviousModal] = useState(false)
  const [previousVideos, setPreviousVideos] = useState<VideoProgram[]>([])
  
  // Channel State
  const [channels] = useState<Channel[]>(CHANNELS)
  const [currentChannelId, setCurrentChannelId] = useState<string>(initialChannelId)
  const [showChannelSelector, setShowChannelSelector] = useState(false)
  
  // Player State
  const [currentProgram, setCurrentProgram] = useState<VideoProgram | null>(null)
  const [nextProgram, setNextProgram] = useState<VideoProgram | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState('0:00')
  const [displayTime, setDisplayTime] = useState('0:00')
  const [videoDuration, setVideoDuration] = useState(0)
  const [cycleInfo, setCycleInfo] = useState({ current: 1, total: 1 })
  const [upcomingVideos, setUpcomingVideos] = useState<VideoProgram[]>([])
  
  // App State
  const [isLoading, setIsLoading] = useState(false)
  const [showStartScreen, setShowStartScreen] = useState(showStartModal)
  const [playerReady, setPlayerReady] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [serverTimeOffset, setServerTimeOffset] = useState(0)
  
  // Refs
  const playerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1025px)')
  const lastVideoIdRef = useRef<string>('')
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)
  const masterEpochRef = useRef<number>(MASTER_EPOCH_START)
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const videoEndTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTransitioningRef = useRef(false)
  
  // YouTube player hook
  const { 
    containerRef: youtubeContainerRef, 
    initializePlayer, 
    loadVideo, 
    getDuration,
    setVolume: setYouTubeVolume,
    setMuted: setYouTubeMuted,
    seekTo,
    getCurrentTime,
    play,
    destroy
  } = useYouTubePlayer()

  // Load previous videos when channel changes
  useEffect(() => {
    if (currentChannelId) {
      const saved = getPreviousVideos(currentChannelId)
      setPreviousVideos(saved)
    }
  }, [currentChannelId])

  // Update showStartScreen when prop changes
  useEffect(() => {
    setShowStartScreen(showStartModal)
  }, [showStartModal])

  // Update currentChannelId when initialChannelId changes
  useEffect(() => {
    if (initialChannelId && initialChannelId !== currentChannelId) {
      setCurrentChannelId(initialChannelId)
    }
  }, [initialChannelId, currentChannelId])

  // Play next video function - CRITICAL for continuous playback
  const playNextVideo = useCallback(() => {
    if (isTransitioningRef.current || !currentProgram || !nextProgram || !currentChannelId) {
      console.log('❌ Cannot play next video: missing program or channel')
      return
    }
    
    isTransitioningRef.current = true
    
    console.log('▶️ Playing next video:', nextProgram.title)
    
    // Add current video to previous list
    if (currentProgram) {
      const updatedPrevious = addToPreviousVideos(currentChannelId, currentProgram)
      setPreviousVideos(updatedPrevious)
    }
    
    const startTime = 0
    
    // Update state with next program
    setCurrentProgram(nextProgram)
    setCurrentTime(startTime)
    setDisplayTime(formatTime(startTime))
    setVideoDuration(nextProgram.duration)
    
    // Find the next next program
    const programs = getChannelPrograms(currentChannelId)
    const currentIndex = programs.findIndex(p => p.id === nextProgram.id)
    const nextNextIndex = (currentIndex + 1) % programs.length
    const nextNextProgram = programs[nextNextIndex]
    setNextProgram(nextNextProgram)
    
    // Update cycle info
    setCycleInfo(prev => ({ 
      current: (prev.current % prev.total) + 1, 
      total: prev.total 
    }))
    
    // Update upcoming videos list
    const newUpcoming: VideoProgram[] = []
    for (let i = 1; i <= 15; i++) {
      newUpcoming.push(programs[(currentIndex + i) % programs.length])
    }
    setUpcomingVideos(newUpcoming)
    
    // Clear any existing timeout
    if (videoEndTimeoutRef.current) {
      clearTimeout(videoEndTimeoutRef.current)
      videoEndTimeoutRef.current = null
    }
    
    // Load and play the next video
    lastVideoIdRef.current = nextProgram.videoId
    const loaded = loadVideo(nextProgram.videoId, startTime)
    
    if (loaded) {
      console.log('✅ Next video loaded successfully')
      setYouTubeVolume(volume)
      setYouTubeMuted(isMuted)
      
      // Small delay to ensure video is loaded
      setTimeout(() => {
        play()
        console.log('▶️ Playing next video now')
        isTransitioningRef.current = false
        
        // Get duration from YouTube API
        const duration = getDuration()
        if (duration && duration > 0) {
          setVideoDuration(duration)
        }
      }, 200)
    } else {
      console.error('❌ Failed to load next video')
      isTransitioningRef.current = false
    }
    
  }, [currentProgram, nextProgram, currentChannelId, loadVideo, volume, isMuted, setYouTubeVolume, setYouTubeMuted, play, getDuration])

  // Update time display - uses actual video time from YouTube
  const updateTimeDisplay = useCallback(() => {
    if (!currentProgram || isTransitioningRef.current) return
    
    // Get current time from YouTube player
    const playerTime = getCurrentTime()
    
    if (playerTime !== undefined && !isNaN(playerTime)) {
      setCurrentTime(playerTime)
      setDisplayTime(formatTime(playerTime))
      
      // Use video duration from YouTube API if available, otherwise use program duration
      const duration = getDuration()
      const actualDuration = duration > 0 ? duration : videoDuration
      
      const remaining = Math.max(0, actualDuration - playerTime)
      setTimeRemaining(formatTime(remaining))
      
      // Check if video is near the end (less than 0.5 seconds remaining)
      if (actualDuration > 0 && remaining <= 0.5 && !isTransitioningRef.current && nextProgram) {
        console.log('⚠️ Video ending soon, preparing next video...')
        if (videoEndTimeoutRef.current) {
          clearTimeout(videoEndTimeoutRef.current)
        }
        // Play next video immediately
        playNextVideo()
      }
    }
  }, [currentProgram, getCurrentTime, getDuration, videoDuration, nextProgram, playNextVideo])

  const loadChannel = useCallback(async (channelId: string) => {
    if (isLoading) return
    
    setIsLoading(true)
    setApiError(null)
    setCurrentChannelId(channelId)
    onChannelChange?.(channelId)
    
    saveChannel(channelId)
    
    // Load previous videos for this channel
    const savedPrevious = getPreviousVideos(channelId)
    setPreviousVideos(savedPrevious)
    
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
      setVideoDuration(program.duration)
      setCycleInfo({ 
        current: result.data.programIndex + 1, 
        total: result.data.totalPrograms 
      })
      
      // Set upcoming videos
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
            onStartClick?.()
            
            seekTo(startTime, true)
            play()
            
            // Get actual duration from YouTube
            const duration = getDuration()
            if (duration && duration > 0) {
              setVideoDuration(duration)
            }
            
            setYouTubeVolume(volume)
            setYouTubeMuted(false)
          },
          onStateChange: (state) => {
            if (!mountedRef.current) return
            
            console.log('🎬 YouTube state changed:', state)
            
            if (state === YT_STATE.ENDED) {
              console.log('📺 Video ended event received - playing next')
              if (videoEndTimeoutRef.current) {
                clearTimeout(videoEndTimeoutRef.current)
              }
              playNextVideo()
            } else if (state === YT_STATE.PLAYING) {
              console.log('▶️ Video is now playing')
            } else if (state === YT_STATE.PAUSED) {
              console.log('⏸️ Video paused - resuming')
              play()
            } else if (state === YT_STATE.BUFFERING) {
              console.log('⏳ Video buffering...')
            } else if (state === YT_STATE.CUED) {
              console.log('🎬 Video cued - playing')
              play()
            }
          },
          onDurationChange: (duration) => {
            if (duration && duration > 0) {
              console.log('📏 Video duration:', duration)
              setVideoDuration(duration)
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
  }, [isLoading, playerReady, volume, initializePlayer, loadVideo, seekTo, play, setYouTubeVolume, setYouTubeMuted, onChannelChange, onStartClick, getDuration, playNextVideo])

  const handleFirstTimeStart = useCallback(() => {
    if (!currentChannelId) {
      setShowChannelSelector(true)
    } else {
      loadChannel(currentChannelId)
    }
  }, [currentChannelId, loadChannel])

  const handleSelectChannel = useCallback((channelId: string) => {
    setShowChannelSelector(false)
    loadChannel(channelId)
  }, [loadChannel])

  const handleOpenChannelSelector = useCallback(() => {
    setShowChannelSelector(true)
  }, [])

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
      
      // Only update upcoming videos, don't interrupt current playback
      const programs = getChannelPrograms(currentChannelId)
      const upcoming: VideoProgram[] = []
      for (let i = 1; i <= 15; i++) {
        const nextIndex = (result.data.programIndex + i) % programs.length
        upcoming.push(programs[nextIndex])
      }
      setUpcomingVideos(upcoming)
      
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }, [playerReady, currentChannelId])

  const handleReload = useCallback(() => {
    console.log('🔄 Reloading...')
    setShowStartScreen(true)
    setPlayerReady(false)
    setCurrentProgram(null)
    setCurrentChannelId('')
    setApiError(null)
    destroy()
    
    setTimeout(() => {
      setShowStartScreen(true)
    }, 100)
  }, [destroy])

  // Handle playing from previous videos
  const handlePlayFromPrevious = useCallback((video: VideoProgram) => {
    if (!currentChannelId || !playerReady || isTransitioningRef.current) return
    
    isTransitioningRef.current = true
    
    console.log('▶️ Playing from previous list:', video.title)
    
    // Add current video to previous before switching
    if (currentProgram) {
      addToPreviousVideos(currentChannelId, currentProgram)
    }
    
    // Update state
    setCurrentProgram(video)
    setCurrentTime(0)
    setDisplayTime(formatTime(0))
    setVideoDuration(video.duration)
    
    // Find next program
    const programs = getChannelPrograms(currentChannelId)
    const currentIndex = programs.findIndex(p => p.id === video.id)
    const nextIndex = (currentIndex + 1) % programs.length
    setNextProgram(programs[nextIndex])
    
    // Update upcoming
    const upcoming: VideoProgram[] = []
    for (let i = 1; i <= 15; i++) {
      upcoming.push(programs[(currentIndex + i) % programs.length])
    }
    setUpcomingVideos(upcoming)
    
    // Update cycle info
    setCycleInfo({ current: currentIndex + 1, total: programs.length })
    
    // Load and play
    lastVideoIdRef.current = video.videoId
    loadVideo(video.videoId, 0)
    
    setTimeout(() => {
      play()
      isTransitioningRef.current = false
    }, 200)
    
  }, [currentChannelId, playerReady, currentProgram, loadVideo, play])

  // Fullscreen handlers
  const handleFullscreen = async () => {
    if (!playerRef.current) return
    
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } else {
        await playerRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Time update interval - runs every 100ms for smooth display
  useEffect(() => {
    if (!playerReady || !currentProgram || isTransitioningRef.current) return
    
    timeUpdateIntervalRef.current = setInterval(() => {
      updateTimeDisplay()
    }, 100)
    
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current)
      }
    }
  }, [playerReady, currentProgram, updateTimeDisplay, isTransitioningRef.current])

  // 5-minute sync interval
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

  // Cleanup
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
      if (videoEndTimeoutRef.current) {
        clearTimeout(videoEndTimeoutRef.current)
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
    if (isMuted || volume === 0) return <VolumeX className={isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
    if (volume < 30) return <Volume className={isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
    if (volume < 70) return <Volume1 className={isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
    return <Volume2 className={isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
  }

  const isLastInCycle = currentProgram && cycleInfo.total ? cycleInfo.current === cycleInfo.total : false

  return (
    <div className="relative flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black min-h-screen w-full overflow-hidden">
      <div className={`relative w-full ${
        isDesktop ? 'md:w-[80vw] md:max-w-[1600px]' :
        isTablet ? 'w-[90vw]' :
        'w-full'
      }`}>
        <div 
          ref={playerRef}
          className={`relative w-full aspect-video bg-black/50 backdrop-blur-sm overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 ${
            isFullscreen ? 'rounded-none border-0' : 'rounded-2xl md:rounded-3xl'
          }`}
        >
          {/* YouTube iframe container */}
          <div ref={youtubeContainerRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 w-full h-full pointer-events-auto" />
          
          {/* Time Display */}
          {!showStartScreen && playerReady && !isLoading && !apiError && (
            isMobile ? (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-2 right-2 z-40"
              >
                <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-xl rounded-lg border border-white/10 shadow-lg">
                  <Clock className="h-2.5 w-2.5 text-primary" />
                  <span className="text-white font-medium text-[9px] tracking-wide">
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
              </motion.div>
            ) : (
              <ModernTimeDisplay />
            )
          )}
          
          {/* START SCREEN */}
          {showStartScreen && !isLoading && !apiError && (
            <StartScreen onPlayClick={handleFirstTimeStart} />
          )}
          
          {/* Loading overlay */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-40"
            >
              <div className="text-center">
                <div className="relative mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative inline-block"
                  >
                    <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
                    <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="relative"
                    >
                      <Tv className="h-16 w-16 text-primary relative z-10" />
                    </motion.div>
                    <motion.div
                      animate={{ y: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-sm"
                    />
                  </motion.div>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white text-lg mb-2 font-medium"
                >
                  Tuning into your broadcast...
                </motion.p>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/60 text-sm"
                >
                  Please wait while we connect
                </motion.p>

                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-6 h-1 w-48 bg-primary/20 rounded-full overflow-hidden mx-auto"
                >
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {/* Error overlay */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-40"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="text-center max-w-md px-6"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-6"
                >
                  <AlertCircle className="h-20 w-20 text-red-500 mx-auto" />
                </motion.div>
                <h3 className="text-white text-xl font-bold mb-2">Failed to Load</h3>
                <p className="text-white/60 text-sm mb-6">{apiError}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleReload} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white rounded-full px-6 py-3">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Try Again
                  </Button>
                  <Button onClick={handleOpenChannelSelector} variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-6 py-3">
                    Change Channel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Player UI */}
          {!showStartScreen && !isLoading && !apiError && playerReady && currentProgram && (
            <>
              {/* TOP LEFT SECTION - Desktop only */}
              {!isMobile && (
                <div className="absolute top-4 left-4 z-40">
                  <div className="flex items-center gap-3">
                    <LiveBadge isMobile={isMobile} />
                    <div className="flex flex-col">
                      <h2 className="text-white font-bold text-lg line-clamp-1">
                        {currentProgram.title}
                      </h2>
                      <p className="text-white/60 text-sm">
                        {currentProgram.category || 'Program'} • {cycleInfo.current}/{cycleInfo.total} • {
                          channels.find(c => c.id === currentChannelId)?.name
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* BOTTOM TICKER - 360-degree infinite scroll, bold text */}
              {showTicker && (
                <motion.div
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", damping: 20, delay: 0.1 }}
                  className="absolute bottom-0 left-0 right-0 z-30"
                >
                  <div className={`relative overflow-hidden bg-gradient-to-r from-black/95 via-black/90 to-black/95 backdrop-blur-xl border-t border-white/10 ${
                    isMobile ? 'h-16' : 'h-20'
                  }`}>
                    <div className="relative h-full flex items-center px-2 md:px-4">
                      {/* Left Section - Deeni.tv Logo */}
                      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                        <DeeniLogo isMobile={isMobile} />
                      </div>

                      {/* Desktop Ticker - 360-degree infinite scroll */}
                      {!isMobile && (
                        <>
                          <div className="flex-1 min-w-0 overflow-hidden mx-4">
                            <DesktopTicker 
                              videos={upcomingVideos} 
                              currentIndex={cycleInfo.current - 1}
                              totalPrograms={cycleInfo.total}
                              currentProgramId={currentProgram.id}
                            />
                          </div>
                          
                          {/* Time Section - Bold text */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <span className="text-white font-black text-xs whitespace-nowrap">
                                {displayTime} / {formatTime(videoDuration)}
                              </span>
                            </div>
                            
                            {timeRemaining && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                <Hourglass className="h-3.5 w-3.5 text-primary" />
                                <span className="text-primary font-black text-xs whitespace-nowrap">
                                  {timeRemaining}
                                </span>
                              </div>
                            )}
                            
                            {/* Previous Videos Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowPreviousModal(true)}
                              className="text-white/90 hover:bg-white/20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 h-9 w-9"
                              title="Previously Watched"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                      
                      {/* Mobile Ticker - 360-degree infinite scroll, bold text */}
                      {isMobile && (
                        <>
                          <div className="flex-1 min-w-0 overflow-hidden ml-2">
                            <MobileTicker 
                              videos={upcomingVideos} 
                              currentIndex={cycleInfo.current - 1}
                              totalPrograms={cycleInfo.total}
                              currentProgramId={currentProgram.id}
                            />
                          </div>
                          
                          {/* Mobile Time - Positioned at top right of ticker */}
                          <div className="absolute -top-10 right-2 flex items-center gap-1 z-40 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 shadow-lg">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-primary" />
                              <span className="text-white font-black text-[10px] whitespace-nowrap">
                                {displayTime}
                              </span>
                            </div>
                            <span className="text-white/30 text-[8px] mx-0.5">|</span>
                            <div className="flex items-center gap-1">
                              <Hourglass className="h-3 w-3 text-primary" />
                              <span className="text-primary font-black text-[10px] whitespace-nowrap">
                                {timeRemaining}
                              </span>
                            </div>
                          </div>
                          
                          {/* Mobile Previous Videos Button - Moved to left */}
                          {/* <div className="absolute -top-10 left-2 z-40">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowPreviousModal(true)}
                              className="text-white/90 hover:bg-white/20 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 h-6 w-6"
                              title="Previously Watched"
                            >
                              <History className="h-3 w-3" />
                            </Button>
                          </div> */}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bottom Controls */}
              <AnimatePresence>
                {controlsVisible && showControls && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ type: "spring", damping: 20 }}
                    className={`absolute ${showTicker ? 'bottom-16' : 'bottom-0'} left-0 right-0 z-50`}
                  >
                    <div className="bg-gradient-to-t from-black/90 via-black/80 to-transparent backdrop-blur-sm pt-4 md:pt-8">
                      <div className={`bg-black/40 backdrop-blur-xl border-t border-white/10 ${
                        isMobile ? 'px-3 py-2' : 'px-6 py-4'
                      }`}>
                        <div className="flex items-center justify-between gap-2 md:gap-4">
                          {/* Volume Control */}
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center gap-2 md:gap-3 flex-1 ${
                              isMobile ? 'max-w-[100px]' : 'max-w-xs'
                            } bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 md:px-3 md:py-2 border border-white/20`}
                          >
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={toggleMute} 
                              className={`text-white/90 hover:bg-white/20 rounded-full ${
                                isMobile ? 'h-7 w-7' : 'h-9 w-9'
                              }`}
                            >
                              {getVolumeIcon()}
                            </Button>
                            <div className="flex-1 relative">
                              {showVolumeTooltip && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white ${
                                    isMobile ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-1.5'
                                  } rounded-full border border-white/10 shadow-lg whitespace-nowrap`}
                                >
                                  {volume}%
                                </motion.div>
                              )}
                              <Slider 
                                value={[volume]} 
                                onValueChange={handleVolumeChange} 
                                max={100} 
                                step={1} 
                                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-2 [&_[role=slider]]:border-white/20"
                              />
                            </div>
                          </motion.div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 md:gap-2">
                            {[
                              { icon: Globe, onClick: handleOpenChannelSelector, title: 'Change Channel' },
                              { icon: showTicker ? EyeOff : Eye, onClick: () => setShowTicker(!showTicker), title: showTicker ? 'Hide Ticker' : 'Show Ticker' },
                              { icon: History, onClick: () => setShowPreviousModal(true), title: 'Previously Watched' },
                              { icon: RefreshCw, onClick: handleReload, title: 'Reload' },
                              // { icon: isFullscreen ? Minimize : Maximize, onClick: handleFullscreen, title: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' },
                              { icon: MoreHorizontal, onClick: onMenuOpen, title: 'Menu' },
                            ].map((item, index) => (
                              <motion.div
                                key={index}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={item.onClick}
                                  className={`text-white/90 hover:bg-white/20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 ${
                                    isMobile ? 'h-8 w-8' : 'h-10 w-10'
                                  }`}
                                  title={item.title}
                                >
                                  <item.icon className={isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
                                </Button>
                              </motion.div>
                            ))}
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

        {/* Program Info Section - Below iframe */}
        {!showStartScreen && !isLoading && !apiError && playerReady && currentProgram && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 w-full"
          >
            {isMobile ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <LiveBadge isMobile={true} />
                  <span className="text-white/60 text-xs">
                    {currentProgram.category || 'Program'} • {cycleInfo.current}/{cycleInfo.total} • {
                      channels.find(c => c.id === currentChannelId)?.name
                    }
                  </span>
                </div>
                <h3 className="text-white font-bold text-base mb-2">
                  {currentProgram.title}
                </h3>
                {currentProgram.description && (
                  <p className="text-white/60 text-sm leading-relaxed">
                    {currentProgram.description}
                  </p>
                )}
              </>
            ) : (
              <>
                <h3 className="text-white font-bold text-xl mb-2">
                  {currentProgram.title}
                </h3>
                {currentProgram.description && (
                  <p className="text-white/60 leading-relaxed">
                    {currentProgram.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { label: 'Category', value: currentProgram.category },
                    { label: 'Language', value: currentProgram.language },
                    { label: 'Duration', value: formatTime(videoDuration) },
                    { label: 'Program', value: `${cycleInfo.current}/${cycleInfo.total}` },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-white/40 text-xs mb-1">{item.label}</p>
                      <p className="text-white font-semibold text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
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

      {/* Previous Videos Modal */}
      <PreviousVideosModal
        isOpen={showPreviousModal}
        onClose={() => setShowPreviousModal(false)}
        videos={previousVideos}
        onPlayVideo={handlePlayFromPrevious}
        currentChannelId={currentChannelId}
      />
    </div>
  )
}
