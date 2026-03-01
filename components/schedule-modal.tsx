'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoProgram } from '@/types/schedule'
import { formatTime, formatDuration } from '@/lib/schedule-utils'
import { useMediaQuery } from '@/hooks/use-media-query'

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  schedule: VideoProgram[]
  currentProgramId?: string
}

export function ScheduleModal({ isOpen, onClose, schedule, currentProgramId }: ScheduleModalProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  
  // Filter out watched programs - only show current and upcoming
  const filteredSchedule = schedule.filter((program, index) => {
    const currentIndex = schedule.findIndex(p => p.id === currentProgramId)
    // Show current program and all upcoming programs
    return index >= currentIndex
  })

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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-white">Today's Schedule</h2>
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
            
            {/* Schedule List - Display only, no hover/click */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
              <div className="space-y-2">
                {filteredSchedule.map((program, index) => {
                  const isCurrent = program.id === currentProgramId
                  
                  return (
                    <motion.div
                      key={program.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border select-none ${
                        isCurrent 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isCurrent && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                                Now Playing
                              </span>
                            )}
                            {!isCurrent && index === 1 && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-300 rounded-full">
                                Up Next
                              </span>
                            )}
                          </div>
                          <h3 className={`font-semibold mb-1 truncate ${
                            isCurrent ? 'text-primary' : 'text-white'
                          }`}>
                            {program.title}
                          </h3>
                        </div>
                        
                        {/* Duration badge */}
                        <div className="flex-shrink-0">
                          <span className="px-3 py-1 text-xs font-medium bg-white/10 text-white/80 rounded-full">
                            {formatDuration(program.duration)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
