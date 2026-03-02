'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Languages, Calendar, Info, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMediaQuery } from '@/hooks/use-media-query'

interface MenuDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSelectOption: (option: 'language' | 'schedule' | 'about' | 'history') => void
}

export function MenuDrawer({ isOpen, onClose, onSelectOption }: MenuDrawerProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  
  const menuItems = [
    { id: 'language' as const, label: 'Language', icon: Languages },
    { id: 'schedule' as const, label: 'Today\'s Schedule', icon: Calendar },
    { id: 'history' as const, label: 'Watch History', icon: History },
    { id: 'about' as const, label: 'About', icon: Info },
  ]

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

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-l border-white/10 z-50 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
                <h2 className="text-lg md:text-xl font-semibold text-white">Menu</h2>
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

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectOption(item.id)
                          onClose()
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 transition-all text-left group"
                      >
                        <div className="p-2 rounded-lg bg-primary/20 text-primary group-hover:bg-primary/30 transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-white font-medium">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
