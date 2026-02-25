'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, History, Play, Calendar, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoProgram } from '@/types/schedule'
import { formatTime, formatDuration } from '@/lib/schedule-utils'
import { useState } from 'react'

interface PreviousVideosModalProps {
  isOpen: boolean
  onClose: () => void
  videos: VideoProgram[]
  onPlayVideo?: (video: VideoProgram) => void
}

export function PreviousVideosModal({ isOpen, onClose, videos, onPlayVideo }: PreviousVideosModalProps) {
  const [showMenuFor, setShowMenuFor] = useState<string | null>(null)

  const formatWatchedTime = (timestamp?: number) => {
    if (!timestamp) return 'Recently watched'
    
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

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
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[80vh] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-2xl shadow-2xl border border-white/10 z-[70] overflow-hidden"
          >
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 animate-gradient" />
              <div className="relative flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Previously Watched</h2>
                  <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60">
                    {videos.length} videos
                  </span>
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
            
            {/* Videos List */}
            <div className="p-4 max-h-[calc(80vh-80px)] overflow-y-auto custom-scrollbar">
              {videos.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 text-sm">No previously watched videos</p>
                  <p className="text-white/40 text-xs mt-2">Videos you watch will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <motion.div
                      key={`${video.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group relative bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 p-4">
                        {/* Video Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-primary/30">
                            <Play className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        
                        {/* Video Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-white/40">{video.category}</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-white/40">{video.language}</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-white/40">{formatDuration(video.duration)}</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-primary/80 text-[10px]">
                              {formatWatchedTime(video.watchedAt)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Duration */}
                        <div className="flex-shrink-0 px-3 py-1 bg-white/10 rounded-full">
                          <span className="text-white/80 text-xs font-mono">
                            {formatTime(video.duration)}
                          </span>
                        </div>
                        
                        {/* Menu Button */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowMenuFor(showMenuFor === video.id ? null : video.id)}
                            className="text-white/40 hover:text-white hover:bg-white/10 rounded-lg"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          
                          {/* Menu Dropdown */}
                          <AnimatePresence>
                            {showMenuFor === video.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-xl border border-white/10 shadow-xl overflow-hidden z-10"
                              >
                                <button
                                  onClick={() => {
                                    onPlayVideo?.(video)
                                    setShowMenuFor(null)
                                    onClose()
                                  }}
                                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 flex items-center gap-2 text-sm"
                                >
                                  <Play className="h-4 w-4 text-primary" />
                                  Play Now
                                </button>
                                <button
                                  onClick={() => {
                                    // Add to playlist functionality
                                    setShowMenuFor(null)
                                  }}
                                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 flex items-center gap-2 text-sm"
                                >
                                  <Calendar className="h-4 w-4 text-primary" />
                                  Add to Schedule
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}