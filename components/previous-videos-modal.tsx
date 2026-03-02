
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, History, Play, ArrowLeft, Volume2, Volume1, Volume, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { VideoProgram } from '@/types/schedule'
import { formatDuration } from '@/lib/schedule-utils'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'

interface PreviousVideosModalProps {
  isOpen: boolean
  onClose: () => void
  videos: VideoProgram[]
  onPlayVideo?: (video: VideoProgram) => void
  currentChannelId?: string
  onPauseMainPlayer?: () => void
  onResumeMainPlayer?: () => void
}

// Breaking News Style Ticker Component - Infinite 360-degree scroll
const BreakingNewsTicker = ({ 
  videos, 
  currentVideoId 
}: { 
  videos: VideoProgram[]
  currentVideoId?: string 
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)')
  
  // Filter out current video and get remaining videos
  const remainingVideos = videos.filter(v => v.id !== currentVideoId)
  
  if (remainingVideos.length === 0) return null
  
  const items: React.ReactElement[] = []
  const repeatCount = 30 // High count for smooth infinite loop
  
  for (let i = 0; i < repeatCount; i++) {
    remainingVideos.forEach((video, videoIndex) => {
      // Only the FIRST video in the original list is "NEXT" - not all index 0s in repeats
      const isNextVideo = videoIndex === 0
      const duration = formatDuration(video.duration)
      
      items.push(
        <div 
          key={`ticker-${video.id}-${i}-${videoIndex}`} 
          className={`inline-flex items-center ${isMobile ? 'mx-4' : 'mx-8'}`}
        >
          {/* Badge - NEXT is very prominent, UP NEXT is subtle */}
          {isNextVideo ? (
            <span className={`
              rounded-full font-black mr-3 whitespace-nowrap uppercase tracking-wider
              bg-gradient-to-r from-yellow-400 to-yellow-500 text-black
              border-2 border-yellow-300 shadow-xl shadow-yellow-400/60
              ${isMobile ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-sm'}
            `}>
              ▶ NEXT
            </span>
          ) : (
            <span className={`
              rounded-full font-medium mr-2 whitespace-nowrap uppercase tracking-wider
              bg-white/10 text-white/60 border border-white/20
              ${isMobile ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'}
            `}>
              UP NEXT
            </span>
          )}
          
          {/* Title - Full text visible, no truncation */}
          <span className={`
            tracking-wide whitespace-nowrap
            ${isMobile ? 'text-sm' : 'text-base'}
            ${isNextVideo 
              ? 'text-yellow-200 font-black text-shadow-lg' 
              : 'text-white/80 font-semibold'
            }
          `}>
            {video.title}
          </span>
          
          {/* Duration */}
          <span className={`
            font-mono whitespace-nowrap
            ${isMobile ? 'ml-2 text-[11px]' : 'ml-3 text-sm'}
            ${isNextVideo ? 'text-yellow-300 font-bold' : 'text-white/50 font-medium'}
          `}>
            • {duration}
          </span>
        </div>
      )
    })
  }
  
  // Calculate animation distance based on content - much longer distance for continuous loop
  const totalVideos = remainingVideos.length * repeatCount
  const animationDistance = isMobile ? -(totalVideos * 400) : -(totalVideos * 500)
  const animationDuration = isMobile ? totalVideos * 6 : totalVideos * 5 // Consistent speed per video
  
  return (
    <div className={`
      absolute left-0 right-0 z-20 overflow-hidden
      bg-gradient-to-r from-black via-black/95 to-black
      border-t border-white/10
      ${isMobile ? 'bottom-16 h-12' : 'bottom-20 h-14'}
    `}>
      {/* Gradient Fades */}
      <div className={`absolute left-0 top-0 bottom-0 ${isMobile ? 'w-8' : 'w-16'} bg-gradient-to-r from-black to-transparent z-10 pointer-events-none`} />
      <div className={`absolute right-0 top-0 bottom-0 ${isMobile ? 'w-8' : 'w-16'} bg-gradient-to-l from-black to-transparent z-10 pointer-events-none`} />
      
      {/* Infinite Scrolling Content - 360-degree continuous loop */}
      <motion.div
        className="flex items-center h-full whitespace-nowrap"
        animate={{ x: [0, animationDistance] }}
        transition={{ 
          duration: animationDuration,
          repeat: Infinity, 
          ease: "linear"
        }}
        style={{ willChange: "transform" }}
      >
        {items}
      </motion.div>
    </div>
  )
}

// Fullscreen Video Player Modal for previous videos - No YouTube controls
const VideoPlayerModal = ({ 
  video, 
  allVideos,
  isOpen, 
  onClose 
}: { 
  video: VideoProgram | null
  allVideos: VideoProgram[]
  isOpen: boolean
  onClose: () => void 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  
  // Handle volume change via postMessage to YouTube iframe
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    
    // If volume is increased while muted, unmute first
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
      // Send unmute command to YouTube
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'unMute',
          args: []
        }), '*')
      }
    } else if (newVolume === 0) {
      setIsMuted(true)
    }
    
    // Post message to YouTube iframe to change volume
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'setVolume',
        args: [newVolume]
      }), '*')
    }
  }, [isMuted])
  
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: newMuted ? 'mute' : 'unMute',
        args: []
      }), '*')
    }
  }, [isMuted])
  
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className={isMobile ? 'h-6 w-6' : 'h-5 w-5'} />
    if (volume < 30) return <Volume className={isMobile ? 'h-6 w-6' : 'h-5 w-5'} />
    if (volume < 70) return <Volume1 className={isMobile ? 'h-6 w-6' : 'h-5 w-5'} />
    return <Volume2 className={isMobile ? 'h-6 w-6' : 'h-5 w-5'} />
  }
  
  if (!video) return null
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Not clickable */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[80]"
          />
          
          {/* Fullscreen Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] flex flex-col"
          >
            {/* Header with back and close buttons */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 to-transparent p-4 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className={`text-white hover:bg-white/20 rounded-full bg-white/10 backdrop-blur-sm ${
                    isMobile ? 'h-10 w-10' : 'h-9 w-9'
                  }`}
                >
                  <ArrowLeft className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} />
                </Button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-white font-bold truncate ${isMobile ? 'text-base' : 'text-lg'}`}>
                      {video.title}
                    </h3>
                    <p className="text-white/60 text-xs md:text-sm">
                      {formatDuration(video.duration)}
                    </p>
                  </div>
                </div>
                
                {/* Close button - Smaller */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className={`text-white hover:bg-white/20 rounded-full bg-white/10 backdrop-blur-sm ${
                    isMobile ? 'h-12 w-12' : 'h-10 w-10'
                  }`}
                >
                  <X className={isMobile ? 'h-6 w-6' : 'h-5 w-5'} />
                </Button>
              </div>
            </div>
            
            {/* Video iframe - No YouTube controls, no click interaction */}
            <div className="flex-1 flex items-center justify-center bg-black relative select-none">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                className={`${isMobile ? 'w-full h-full' : 'w-full h-full max-h-[80vh]'} pointer-events-none`}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
              
              {/* Breaking News Style Ticker - Above bottom controls */}
              <BreakingNewsTicker 
                videos={allVideos} 
                currentVideoId={video.id} 
              />
            </div>
            
            {/* Bottom Controls - Volume */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 to-transparent p-4 md:p-6">
              <div className="flex items-center justify-center gap-4">
                {/* Volume Control */}
                <div 
                  className={`flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 ${
                    isMobile ? 'px-3 py-0' : 'px-4 py-2'
                  } ${showVolumeSlider || !isMobile ? 'w-auto' : 'w-auto'}`}
                  onMouseEnter={() => !isMobile && setShowVolumeSlider(true)}
                  onMouseLeave={() => !isMobile && setShowVolumeSlider(false)}
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleMute}
                    className={`text-white/90 hover:bg-white/20 rounded-full ${
                      isMobile ? 'h-10 w-10' : 'h-9 w-9'
                    }`}
                  >
                    {getVolumeIcon()}
                  </Button>
                  
                  {/* Volume Slider - Always show on mobile, hover on desktop */}
                  <div className={`${isMobile ? 'w-32' : 'w-40'}`}>
                    <Slider 
                      value={[isMuted ? 0 : volume]} 
                      onValueChange={handleVolumeChange} 
                      max={100} 
                      step={1} 
                      className="h-2 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-2 [&_[role=slider]]:border-white/20 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
                    />
                  </div>
                  
                  <span className="text-white/80 text-sm font-medium min-w-[40px] text-center">
                    {isMuted ? 0 : volume}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function PreviousVideosModal({ 
  isOpen, 
  onClose, 
  videos, 
  onPlayVideo,
  currentChannelId,
  onPauseMainPlayer,
  onResumeMainPlayer
}: PreviousVideosModalProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [mounted, setMounted] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoProgram | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

  // Handle mounting for animations
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handlePlayVideo = useCallback((video: VideoProgram) => {
    // Pause main TV player
    onPauseMainPlayer?.()
    
    // Open fullscreen video player modal
    setSelectedVideo(video)
    setShowVideoPlayer(true)
  }, [onPauseMainPlayer])

  const handleCloseVideoPlayer = useCallback(() => {
    setShowVideoPlayer(false)
    setSelectedVideo(null)
    // Resume main player - will show "Start Watching" state
    onResumeMainPlayer?.()
    // Close this modal too
    onClose()
  }, [onClose, onResumeMainPlayer])

  if (!mounted) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && !showVideoPlayer && (
          <>
            {/* Backdrop - Not clickable */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            />
            
            {/* Modal - Same style as Schedule Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-2xl shadow-2xl border border-white/10 z-[70] overflow-hidden"
              style={{
                width: isMobile ? 'calc(100% - 2rem)' : 'calc(100% - 4rem)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/20 rounded-lg">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Previously Watched
                    </h2>
                    <p className="text-xs text-white/40">
                      {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className={`text-white/60 hover:text-white hover:bg-white/10 rounded-xl ${
                    isMobile ? 'h-12 w-12' : 'h-10 w-10'
                  }`}
                >
                  <X className={isMobile ? 'h-7 w-7' : 'h-5 w-5'} />
                </Button>
              </div>
              
              {/* Videos List - Simplified UI */}
              <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
                {videos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <History className="h-8 w-8 text-white/20 mb-4" />
                    <p className="text-white/60 text-sm mb-2">No previously watched videos</p>
                    <p className="text-white/40 text-xs text-center">
                      Videos you watch will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {videos.map((video, index) => (
                      <motion.button
                        key={`${video.id}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handlePlayVideo(video)}
                        className="w-full p-4 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all group text-left"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0 flex items-center gap-3">
                            {/* Play icon - Smaller */}
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                              <Play className="h-2.5 w-2.5 text-primary fill-primary" />
                            </div>
                            
                            {/* Title only - no type/language info */}
                            <h3 className="text-white font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {video.title}
                            </h3>
                          </div>
                          
                          {/* Duration badge - 1h 40m format */}
                          <div className="flex-shrink-0">
                            <span className="px-3 py-1 text-xs font-medium bg-white/10 text-white/80 rounded-full flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(video.duration)}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Fullscreen Video Player */}
      <VideoPlayerModal
        video={selectedVideo}
        allVideos={videos}
        isOpen={showVideoPlayer}
        onClose={handleCloseVideoPlayer}
      />
    </>
  )
}
