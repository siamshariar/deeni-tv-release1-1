'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Channel } from '@/types/schedule'

interface ChannelSelectorProps {
  isOpen: boolean
  onClose: () => void
  channels: Channel[]
  onSelectChannel: (channelId: string) => void
  currentChannelId?: string
}

export function ChannelSelector({ 
  isOpen, 
  onClose, 
  channels, 
  onSelectChannel, 
  currentChannelId 
}: ChannelSelectorProps) {
  
  const handleSelect = (channelId: string) => {
    console.log('🎯 ChannelSelector: selecting', channelId)
    onSelectChannel(channelId)
    // Don't call onClose here - let the parent handle it
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-white">Select Channel</h2>
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
            
            {/* Channel List */}
            <div className="p-4">
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
                    onClick={() => handleSelect(channel.id)}
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