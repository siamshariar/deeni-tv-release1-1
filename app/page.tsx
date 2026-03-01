'use client'

import { useState, useEffect } from 'react'
import { SyncedVideoPlayer } from '@/components/synced-video-player'
import { MenuDrawer } from '@/components/menu-drawer'
import { DonateButton } from '@/components/donate-button'
import { ScheduleModal } from '@/components/schedule-modal'
import { AboutModal } from '@/components/about-modal'
import { ChannelSelector } from '@/components/channel-selector'
import { CHANNELS, getSavedChannel, saveChannel } from '@/lib/schedule-utils'

export default function Home() {
  const [activeChannelId, setActiveChannelId] = useState<string>('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChannelSelectorOpen, setIsChannelSelectorOpen] = useState(false)
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false)
  const [activeModal, setActiveModal] = useState<'schedule' | 'about' | null>(null)
  const [currentProgramId, setCurrentProgramId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [showStartModal, setShowStartModal] = useState(false)
  const [openHistoryModal, setOpenHistoryModal] = useState(false)

  // Check localStorage for saved channel on initial load
  useEffect(() => {
    const savedChannel = getSavedChannel()
    if (savedChannel && CHANNELS.some(c => c.id === savedChannel)) {
      setActiveChannelId(savedChannel)
      setHasUserInteracted(true)
      setIsFirstTimeUser(false)
      // If channel exists, show start modal
      setShowStartModal(true)
    } else {
      // First time user - show channel selector immediately (must select)
      setIsFirstTimeUser(true)
      setIsChannelSelectorOpen(true)
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
    saveChannel(channelId)
    setHasUserInteracted(true)
    setIsFirstTimeUser(false)
    setIsChannelSelectorOpen(false)
    
    // After channel selection, show start modal
    setTimeout(() => {
      setShowStartModal(true)
    }, 300)
  }

  const handleStartClick = () => {
    setShowStartModal(false)
    // The video player will handle the actual playback
  }

  const handleMenuOptionSelect = (option: 'language' | 'schedule' | 'about' | 'history') => {
    setIsMenuOpen(false)
    
    if (option === 'language') {
      setTimeout(() => {
        setIsFirstTimeUser(false) // Not first time when opening from menu
        setIsChannelSelectorOpen(true)
      }, 300)
    } else if (option === 'history') {
      // Open history modal in the player
      setTimeout(() => {
        setOpenHistoryModal(true)
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

  const handleCloseChannelSelector = () => {
    // If first time user closes without selecting, don't allow
    if (isFirstTimeUser && !activeChannelId) {
      return // Do nothing, must select
    }
    setIsChannelSelectorOpen(false)
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
        showStartModal={showStartModal}
        onStartClick={handleStartClick}
        openHistoryModal={openHistoryModal}
        onHistoryModalClose={() => setOpenHistoryModal(false)}
      />
      
      {/* Menu Drawer - Slides from bottom */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectOption={handleMenuOptionSelect}
      />
      
      {/* Channel/Language Selector */}
      <ChannelSelector
        isOpen={isChannelSelectorOpen}
        onClose={handleCloseChannelSelector}
        channels={CHANNELS}
        onSelectChannel={handleSelectChannel}
        currentChannelId={activeChannelId}
        isFirstTime={isFirstTimeUser}
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
