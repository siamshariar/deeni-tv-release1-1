'use client'

import { useState, useEffect, useCallback } from 'react'
import { SyncedVideoPlayer } from '@/components/synced-video-player'
import { MenuDrawer, MenuOption } from '@/components/menu-drawer'
import { DonateButton } from '@/components/donate-button'
import { ScheduleModal } from '@/components/schedule-modal'
import { AboutModal } from '@/components/about-modal'
import { ChannelSelector } from '@/components/channel-selector'
import { VideoProgram } from '@/types/schedule'
import { CHANNELS, getSavedChannel, saveChannel } from '@/lib/schedule-utils'

export default function Home() {
  const [activeChannelId, setActiveChannelId] = useState<string>('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChannelSelectorOpen, setIsChannelSelectorOpen] = useState(false)
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false)
  const [activeModal, setActiveModal] = useState<'schedule' | 'about' | null>(null)
  const [currentProgramId, setCurrentProgramId] = useState<string>('')
  const [liveSchedule, setLiveSchedule] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [showStartModal, setShowStartModal] = useState(false)
  const [openHistoryModal, setOpenHistoryModal] = useState(false)
  const [openChannelSelectorModal, setOpenChannelSelectorModal] = useState(false)
  const [reloadCounter, setReloadCounter] = useState(0)

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

  // Fetch current program and schedule from API when channel changes (initial load only)
  // The SyncedVideoPlayer handles 5-min syncing + instant updates via onProgramChange
  useEffect(() => {
    if (!activeChannelId) return

    const fetchCurrentProgram = async () => {
      try {
        const response = await fetch(`/api/current-video?channel=${activeChannelId}`)
        const result = await response.json()
        
        if (result.currentProgram) {
          // New API format
          const currentId = result.currentProgram.ytVideoId
          setCurrentProgramId(currentId)
          
          // Build live schedule from API data
          const schedule: any[] = []
          
          // Add current program
          schedule.push({
            id: result.currentProgram.ytVideoId,
            videoId: result.currentProgram.ytVideoId,
            title: result.currentProgram.title,
            duration: result.currentProgram.duration,
            category: 'Lecture',
            language: CHANNELS.find(c => c.id === activeChannelId)?.language || 'Bengali',
            channelId: activeChannelId,
          })
          
          // Add upcoming programs
          if (result.upcomingPrograms && Array.isArray(result.upcomingPrograms)) {
            result.upcomingPrograms.forEach((prog: any) => {
              schedule.push({
                id: prog.ytVideoId,
                videoId: prog.ytVideoId,
                title: prog.title,
                duration: prog.duration,
                category: 'Lecture',
                language: CHANNELS.find(c => c.id === activeChannelId)?.language || 'Bengali',
                channelId: activeChannelId,
              })
            })
          }
          
          setLiveSchedule(schedule)
        } else if (result.success && result.data) {
          // Fallback for old API format
          setCurrentProgramId(result.data.program.id)
        }
      } catch (error) {
        console.error('Error fetching current program:', error)
      }
    }

    fetchCurrentProgram()
    // No polling interval here — the SyncedVideoPlayer handles periodic + instant syncs
    // and pushes updates via onProgramChange callback
  }, [activeChannelId])

  // Called by SyncedVideoPlayer whenever the current program / schedule changes
  // (video ended → next started, API sync, queue shift, etc.)
  const handleProgramChange = useCallback((newProgramId: string, schedule: VideoProgram[]) => {
    setCurrentProgramId(newProgramId)
    setLiveSchedule(schedule as any[])
  }, [])

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

  const handleMenuOptionSelect = (option: MenuOption) => {
    setIsMenuOpen(false)
    
    if (option === 'language') {
      setTimeout(() => {
        setOpenChannelSelectorModal(true)
      }, 300)
    } else if (option === 'history') {
      setTimeout(() => {
        setOpenHistoryModal(true)
      }, 300)
    } else if (option === 'reload') {
      setReloadCounter(c => c + 1)
    } else if (option === 'donate') {
      window.open('https://www.deeniinfotech.com/donate#donation-form', '_blank', 'noopener,noreferrer')
    } else {
      setTimeout(() => {
        setActiveModal(option as 'schedule' | 'about')
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
      {/* Logo Header - Commented out per requirements */}
      {/* <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-50 flex items-center">
        <img 
          src="/DeeniTV.svg" 
          alt="Deeni.tv Logo" 
          className="h-8 w-auto sm:h-9 md:h-10 lg:h-11 drop-shadow-lg hover:opacity-90 transition-opacity"
        />
      </div> */}
      
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
        onOpenSchedule={() => setActiveModal('schedule')}
        openChannelSelectorModal={openChannelSelectorModal}
        onChannelSelectorModalClose={() => setOpenChannelSelectorModal(false)}
        onProgramChange={handleProgramChange}
        triggerReload={reloadCounter}
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
        schedule={liveSchedule.length > 0 ? liveSchedule : (CHANNELS.find(c => c.id === activeChannelId)?.programs || [])}
        currentProgramId={currentProgramId}
      />
      
      <AboutModal
        isOpen={activeModal === 'about'}
        onClose={handleCloseModal}
      />
    </main>
  )
}