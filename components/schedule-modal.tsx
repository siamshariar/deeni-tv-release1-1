'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoProgram } from '@/types/schedule'
import { formatTime, formatDuration } from '@/lib/schedule-utils'

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  schedule: VideoProgram[]
  currentProgramId?: string
}

export function ScheduleModal({ isOpen, onClose, schedule, currentProgramId }: ScheduleModalProps) {
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-white">Today's Schedule</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Schedule List */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
              <div className="space-y-2">
                {schedule.map((program, index) => {
                  const isCurrent = program.id === currentProgramId
                  
                  return (
                    <motion.div
                      key={program.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border ${
                        isCurrent 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800'
                      } transition-colors cursor-pointer`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white/40">
                              Program {index + 1}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                                Now Playing
                              </span>
                            )}
                          </div>
                          <h3 className={`font-semibold mb-1 truncate ${
                            isCurrent ? 'text-primary' : 'text-white'
                          }`}>
                            {program.title}
                          </h3>
                          {program.description && (
                            <p className="text-sm text-white/60 line-clamp-2 mb-2">
                              {program.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(program.duration)}
                            </span>
                            <span>{program.category}</span>
                            <span>{program.language}</span>
                          </div>
                        </div>
                        
                        {/* Duration badge */}
                        <div className="flex-shrink-0">
                          <span className="px-3 py-1 text-xs font-medium bg-zinc-700/50 text-white/80 rounded-full">
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