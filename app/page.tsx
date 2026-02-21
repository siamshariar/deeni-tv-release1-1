'use client'

import { useState, useEffect } from 'react'
import { SyncedVideoPlayer } from '@/components/synced-video-player'
import { MenuDrawer } from '@/components/menu-drawer'
import { DonateButton } from '@/components/donate-button'
import { LanguageModal } from '@/components/language-modal'
import { ScheduleModal } from '@/components/schedule-modal'
import { AboutModal } from '@/components/about-modal'
import { ChannelSwitcher, type Channel } from '@/components/channel-switcher'
import { SCHEDULE } from '@/lib/schedule-utils'

// Placeholder channels data - can be expanded in the future
const CHANNELS: Channel[] = [
  {
    id: '1',
    name: 'Deeni TV Main',
    videoId: 'TosSYbyRKXs',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop',
    isLive: true,
  },
  {
    id: '2',
    name: 'Islamic Lectures',
    videoId: 'ye6tv8DhnSI',
    thumbnail: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=200&h=200&fit=crop',
    isLive: true,
  },
  {
    id: '3',
    name: 'Quran Recitation',
    videoId: 'k2ExG9Nc_aA',
    thumbnail: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=200&h=200&fit=crop',
    isLive: true,
  },
  {
    id: '4',
    name: 'Spiritual Guidance',
    videoId: '7nJhwFCKMVk',
    thumbnail: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=200&h=200&fit=crop',
    isLive: true,
  },
]

export default function Home() {
  const [activeChannelId, setActiveChannelId] = useState('1')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChannelSwitcherOpen, setIsChannelSwitcherOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<'language' | 'schedule' | 'about' | null>(null)
  const [currentProgramId, setCurrentProgramId] = useState<string>('1')
  const [isLoading, setIsLoading] = useState(true)

  const activeChannel = CHANNELS.find(ch => ch.id === activeChannelId) || CHANNELS[0]

  // Fetch current program ID from API
  useEffect(() => {
    const fetchCurrentProgram = async () => {
      try {
        const response = await fetch('/api/current-video')
        const result = await response.json()
        if (result.success && result.data) {
          setCurrentProgramId(result.data.program.id)
        }
      } catch (error) {
        console.error('Error fetching current program:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentProgram()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchCurrentProgram, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSelectChannel = (channel: Channel) => {
    setActiveChannelId(channel.id)
    // For now, reload the page to load new channel
    // In a more advanced implementation, you could update the video player dynamically
    window.location.reload()
  }

  const handleMenuOptionSelect = (option: 'language' | 'schedule' | 'about') => {
    setIsMenuOpen(false)
    // Small delay to allow menu to close before opening modal
    setTimeout(() => {
      setActiveModal(option)
    }, 300)
  }

  const handleCloseModal = () => {
    setActiveModal(null)
  }

  return (
    <main className="relative min-h-screen bg-zinc-950">
      {/* Donate Button - Fixed position */}
      <DonateButton />
      
      {/* Synchronized Video Player with Integrated Ticker */}
      <SyncedVideoPlayer 
        onMenuOpen={() => setIsMenuOpen(true)}
        onChannelSwitcherOpen={() => setIsChannelSwitcherOpen(true)}
      />
      
      {/* Menu Drawer - Slides from bottom */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectOption={handleMenuOptionSelect}
      />
      
      {/* Channel Switcher - Slides from right */}
      <ChannelSwitcher
        isOpen={isChannelSwitcherOpen}
        onClose={() => setIsChannelSwitcherOpen(false)}
        channels={CHANNELS}
        activeChannelId={activeChannelId}
        onSelectChannel={handleSelectChannel}
      />
      
      {/* Modals - Conditionally rendered based on activeModal */}
      <LanguageModal
        isOpen={activeModal === 'language'}
        onClose={handleCloseModal}
      />
      
      <ScheduleModal
        isOpen={activeModal === 'schedule'}
        onClose={handleCloseModal}
        schedule={SCHEDULE}
        currentProgramId={currentProgramId}
      />
      
      <AboutModal
        isOpen={activeModal === 'about'}
        onClose={handleCloseModal}
      />
    </main>
  )
}