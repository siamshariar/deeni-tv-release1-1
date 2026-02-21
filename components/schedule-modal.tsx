'use client'

import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { VideoProgram } from '@/types/schedule'
import { formatDuration } from '@/lib/schedule-utils'

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-zinc-900 rounded-lg shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">Today's Schedule</h2>
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
            <div className="overflow-y-auto p-4 space-y-2 max-h-[calc(80vh-80px)]">
              {schedule.map((program, index) => {
                const isCurrent = program.id === currentProgramId
                const isNext = !isCurrent && index > 0 && schedule[index - 1].id === currentProgramId
                
                return (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      relative p-4 rounded-lg transition-all
                      ${isCurrent ? 'bg-primary/20 border border-primary/50' : 'bg-zinc-800/50 hover:bg-zinc-800'}
                      ${isNext ? 'ring-1 ring-yellow-500/50' : ''}
                    `}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      {isCurrent && (
                        <span className="px-2 py-1 bg-primary text-xs font-semibold rounded-full">
                          NOW PLAYING
                        </span>
                      )}
                      {isNext && !isCurrent && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-semibold rounded-full border border-yellow-500/30">
                          UP NEXT
                        </span>
                      )}
                    </div>
                    
                    {/* Program Info */}
                    <div className="pr-24">
                      <h3 className="text-white font-semibold mb-1 line-clamp-2">
                        {program.title}
                      </h3>
                      {program.description && (
                        <p className="text-white/60 text-sm line-clamp-2 mb-2">
                          {program.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-primary">
                          Duration: {formatDuration(program.duration)}
                        </span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60">
                          {program.category}
                        </span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60">
                          {program.language}
                        </span>
                      </div>
                    </div>
                    
                    {/* Program Number */}
                    <div className="absolute bottom-2 left-4 text-xs text-white/20">
                      Program {index + 1} of {schedule.length}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}