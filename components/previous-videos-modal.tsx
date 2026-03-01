
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, History, Play, Calendar, MoreVertical, Film, Globe, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoProgram } from '@/types/schedule'
import { formatTime, formatDuration } from '@/lib/schedule-utils'
import { useState, useEffect } from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'

interface PreviousVideosModalProps {
  isOpen: boolean
  onClose: () => void
  videos: VideoProgram[]
  onPlayVideo?: (video: VideoProgram) => void
  currentChannelId?: string
}

export function PreviousVideosModal({ 
  isOpen, 
  onClose, 
  videos, 
  onPlayVideo,
  currentChannelId 
}: PreviousVideosModalProps) {
  const [showMenuFor, setShowMenuFor] = useState<string | null>(null)
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
  const [mounted, setMounted] = useState(false)

  // Handle mounting for animations
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenuFor) {
        setShowMenuFor(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showMenuFor])

  const formatWatchedTime = (timestamp?: number) => {
    if (!timestamp) return 'Recently watched'
    
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(months / 12)
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const handlePlayVideo = (video: VideoProgram) => {
    if (onPlayVideo) {
      onPlayVideo(video)
    }
    onClose()
  }

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
          />
          
          {/* Modal - Fully Responsive with scroll only inside */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-white/10 shadow-2xl overflow-hidden z-[70]"
            style={{
              borderRadius: isMobile ? '1rem' : '1.5rem',
              width: isMobile ? 'calc(100% - 2rem)' : 'calc(100% - 4rem)',
              maxWidth: isMobile ? '100%' : isTablet ? '90%' : '64rem'
            }}
          >
            {/* Header - Fixed */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10" />
              
              <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-primary/20 rounded-lg sm:rounded-xl">
                    <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-white">
                      Previously Watched
                    </h2>
                    <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">
                      {videos.length} {videos.length === 1 ? 'video' : 'videos'} in history
                      {currentChannelId && (
                        <> • {currentChannelId.split('-')[0].charAt(0).toUpperCase() + currentChannelId.split('-')[0].slice(1)} Channel</>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg sm:rounded-xl h-8 w-8 sm:h-10 sm:w-10"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
            
            {/* Videos List - Scrollable inside only */}
            <div 
              className="overflow-y-auto custom-scrollbar flex-1"
              style={{
                maxHeight: isMobile ? 'calc(90vh - 8rem)' : 'calc(80vh - 8rem)'
              }}
            >
              {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <History className="h-12 w-12 sm:h-16 sm:w-16 text-primary/30 relative z-10" />
                  </div>
                  <p className="text-white/60 text-sm sm:text-base mb-2">No previously watched videos</p>
                  <p className="text-white/40 text-xs sm:text-sm text-center">
                    Videos you watch will appear here
                  </p>
                </div>
              ) : (
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {videos.map((video, index) => (
                    <motion.div
                      key={`${video.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group relative bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl border border-white/10 transition-all duration-200"
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
                        {/* Video Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-primary/30">
                            <Film className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                        </div>
                        
                        {/* Video Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 line-clamp-2 sm:line-clamp-1">
                            {video.title}
                          </h3>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {video.category}
                            </span>
                            <span className="flex items-center gap-1 text-white/40">
                              <Globe className="h-3 w-3" />
                              {video.language}
                            </span>
                            <span className="flex items-center gap-1 text-white/40">
                              <Clock className="h-3 w-3" />
                              {formatTime(video.duration)} {/* Fixed: Now using formatTime instead of formatDuration */}
                            </span>
                            <span className="text-primary/60 text-[8px] sm:text-[10px]">
                              {formatWatchedTime(video.watchedAt)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Duration & Menu */}
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {/* Duration Badge */}
                          <div className="hidden xs:block px-2 sm:px-3 py-1 bg-white/10 rounded-full">
                            <span className="text-white/80 text-[10px] sm:text-xs font-mono whitespace-nowrap">
                              {formatTime(video.duration)} {/* Fixed: Using formatTime for consistent display */}
                            </span>
                          </div>
                          
                          {/* Mobile Duration */}
                          <div className="xs:hidden px-1.5 py-0.5 bg-white/10 rounded-full">
                            <span className="text-white/80 text-[8px] font-mono">
                              {formatTime(video.duration)} {/* Fixed: Using formatTime for consistent display */}
                            </span>
                          </div>
                          
                          {/* Menu Button */}
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowMenuFor(showMenuFor === video.id ? null : video.id)
                              }}
                              className="text-white/40 hover:text-white hover:bg-white/10 rounded-lg h-7 w-7 sm:h-8 sm:w-8"
                            >
                              <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                            
                            {/* Menu Dropdown */}
                            <AnimatePresence>
                              {showMenuFor === video.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 mt-2 w-40 sm:w-48 bg-zinc-800 rounded-xl border border-white/10 shadow-xl overflow-hidden z-10"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => handlePlayVideo(video)}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-white hover:bg-white/10 flex items-center gap-2 text-xs sm:text-sm"
                                  >
                                    <Play className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                    Play Now
                                  </button>
                                  <button
                                    onClick={() => {
                                      // This would add to schedule - disabled for now
                                      setShowMenuFor(null)
                                    }}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-white/40 hover:bg-white/5 flex items-center gap-2 text-xs sm:text-sm border-t border-white/10 cursor-not-allowed"
                                    disabled
                                  >
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white/40" />
                                    Add to Schedule
                                    <span className="ml-auto text-[8px] text-white/20">Soon</span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer - Fixed */}
            {videos.length > 0 && (
              <div className="relative border-t border-white/10 p-3 sm:p-4 bg-white/5 flex-shrink-0">
                <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/40">
                  <span>Showing {Math.min(videos.length, 30)} of 30 videos</span>
                  <span>Last watched: {formatWatchedTime(videos[0]?.watchedAt)}</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
