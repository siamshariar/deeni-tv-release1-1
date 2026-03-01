'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Channel } from '@/types/schedule'
import { useMediaQuery } from '@/hooks/use-media-query'

interface ChannelSelectorProps {
  isOpen: boolean
  onClose: () => void
  channels: Channel[]
  onSelectChannel: (channelId: string) => void
  currentChannelId?: string
  isFirstTime?: boolean // If first time, no close option
}

export function ChannelSelector({ 
  isOpen, 
  onClose, 
  channels, 
  onSelectChannel, 
  currentChannelId,
  isFirstTime = false
}: ChannelSelectorProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  
  const handleSelect = (channelId: string) => {
    console.log('🎯 ChannelSelector: selecting', channelId)
    onSelectChannel(channelId)
    // Don't call onClose here - let the parent handle it
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - No onClick if first time (must select) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isFirstTime ? undefined : onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Select Channel</h2>
                  {isFirstTime && (
                    <p className="text-white/40 text-xs flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      Select to continue
                    </p>
                  )}
                </div>
              </div>
              {!isFirstTime && (
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
              )}
            </div>
            
            {/* Channel List */}
            <div className="p-4">
              <p className="text-white/60 text-sm mb-4">
                Choose your preferred language and channel
              </p>
              <div className="space-y-2">
                {channels.map((channel, index) => (
                  <motion.button
                    key={channel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(channel.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      channel.id === currentChannelId
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
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
                    <ChevronRight className={`h-5 w-5 ${
                      channel.id === currentChannelId ? 'text-primary' : 'text-white/20'
                    }`} />
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
