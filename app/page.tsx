'use client'

import { useState, useEffect } from 'react'
import { SyncedVideoPlayer } from '@/components/synced-video-player'
import { MenuDrawer } from '@/components/menu-drawer'
import { DonateButton } from '@/components/donate-button'
import { ScheduleModal } from '@/components/schedule-modal'
import { AboutModal } from '@/components/about-modal'
import { ChannelSelector } from '@/components/channel-selector'
import { CHANNELS } from '@/lib/schedule-utils'

export default function Home() {
  const [activeChannelId, setActiveChannelId] = useState<string>('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChannelSelectorOpen, setIsChannelSelectorOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<'schedule' | 'about' | null>(null)
  const [currentProgramId, setCurrentProgramId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // Check localStorage for saved channel on initial load
  useEffect(() => {
    const savedChannel = localStorage.getItem('deeni-tv-channel')
    if (savedChannel && CHANNELS.some(c => c.id === savedChannel)) {
      setActiveChannelId(savedChannel)
      setHasUserInteracted(true)
    }
    setIsLoading(false)
  }, [])

  // Fetch current program ID from API when channel changes
  useEffect(() => {
    if (!activeChannelId) return

    const fetchCurrentProgram = async () => {
      try {
        const response = await fetch(`/api/current-video?channel=${activeChannelId}`)
        const result = await response.json()
        if (result.success && result.data) {
          setCurrentProgramId(result.data.program.id)
        }
      } catch (error) {
        console.error('Error fetching current program:', error)
      }
    }

    fetchCurrentProgram()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchCurrentProgram, 30000)
    return () => clearInterval(interval)
  }, [activeChannelId])

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId)
    localStorage.setItem('deeni-tv-channel', channelId)
    setHasUserInteracted(true)
    setIsChannelSelectorOpen(false)
  }

  const handleMenuOptionSelect = (option: 'language' | 'schedule' | 'about') => {
    setIsMenuOpen(false)
    
    // Map 'language' option to channel selector
    if (option === 'language') {
      setTimeout(() => {
        setIsChannelSelectorOpen(true)
      }, 300)
    } else {
      setTimeout(() => {
        setActiveModal(option)
      }, 300)
    }
  }

  const handleCloseModal = () => {
    setActiveModal(null)
  }

  // If still loading initial state, show minimal loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading Deeni.tv...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen bg-zinc-950">
      {/* Donate Button - Fixed position */}
      <DonateButton />
      
      {/* Synchronized Video Player */}
      <SyncedVideoPlayer 
        onMenuOpen={() => setIsMenuOpen(true)}
        initialChannelId={activeChannelId}
        onChannelChange={setActiveChannelId}
      />
      
      {/* Menu Drawer - Slides from bottom */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectOption={handleMenuOptionSelect}
      />
      
      {/* Channel/Language Selector */}
      <ChannelSelector
        isOpen={isChannelSelectorOpen || (!hasUserInteracted && !activeChannelId)}
        onClose={() => {
          setIsChannelSelectorOpen(false)
          // If user closes without selecting, set default channel
          if (!activeChannelId) {
            const defaultChannel = CHANNELS[0].id
            setActiveChannelId(defaultChannel)
            localStorage.setItem('deeni-tv-channel', defaultChannel)
            setHasUserInteracted(true)
          }
        }}
        channels={CHANNELS}
        onSelectChannel={handleSelectChannel}
        currentChannelId={activeChannelId}
      />
      
      {/* Modals */}
      <ScheduleModal
        isOpen={activeModal === 'schedule'}
        onClose={handleCloseModal}
        schedule={CHANNELS.find(c => c.id === activeChannelId)?.programs || []}
        currentProgramId={currentProgramId}
      />
      
      <AboutModal
        isOpen={activeModal === 'about'}
        onClose={handleCloseModal}
      />
    </main>
  )
}