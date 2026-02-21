import { useRef, useCallback, useEffect } from 'react'

// YouTube error codes
export const YT_ERRORS = {
  2: 'Invalid video ID',
  5: 'HTML5 player error',
  100: 'Video not found or removed',
  101: 'Video cannot be played in embedded player',
  150: 'Video cannot be played in embedded player'
} as const

// Player states
export const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
} as const

interface YouTubePlayerOptions {
  videoId: string
  startSeconds?: number
  volume?: number
  muted?: boolean
  onReady?: (player: any) => void
  onStateChange?: (state: number) => void
  onError?: (errorCode: number, errorMessage: string) => void
  onTimeUpdate?: (currentTime: number) => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// List of known working videos (always play)
const WORKING_VIDEOS = [
  'jfKfPfyJRdk', // Lofi study music - always works
  '5qap5aO4i9A', // Lofi chill beats - always works
  'DWcJFNfaw9c', // Relaxing music - always works
  'hHW1oY26kxQ', // Calm piano - always works
  '4xDzrJKXOOY'  // Nature sounds - always works
]

export function useYouTubePlayer() {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const apiReadyRef = useRef<boolean>(false)
  const apiLoadingRef = useRef<boolean>(false)
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMutedRef = useRef<boolean>(true)
  const volumeRef = useRef<number>(75)
  const retryCountRef = useRef<number>(0)
  const maxRetries = 2
  const currentVideoIdRef = useRef<string>('')
  
  /**
   * Load YouTube API
   */
  const loadYouTubeAPI = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) {
        console.log('YouTube API already loaded')
        apiReadyRef.current = true
        resolve()
        return
      }

      if (apiLoadingRef.current) {
        const checkInterval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(checkInterval)
            apiReadyRef.current = true
            resolve()
          }
        }, 100)
        
        setTimeout(() => {
          clearInterval(checkInterval)
          reject(new Error('YouTube API load timeout'))
        }, 10000)
        return
      }

      apiLoadingRef.current = true
      
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      
      const timeout = setTimeout(() => {
        reject(new Error('YouTube API load timeout'))
      }, 10000)
      
      script.onload = () => {
        clearTimeout(timeout)
      }
      
      script.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('Failed to load YouTube API'))
      }
      
      document.head.appendChild(script)
      
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready')
        apiReadyRef.current = true
        apiLoadingRef.current = false
        resolve()
      }
    })
  }, [])
  
  /**
   * Get a working video
   */
  const getWorkingVideo = useCallback((): string => {
    const randomIndex = Math.floor(Math.random() * WORKING_VIDEOS.length)
    return WORKING_VIDEOS[randomIndex]
  }, [])
  
  /**
   * Initialize player with all controls hidden
   */
  const initializePlayer = useCallback(async (options: YouTubePlayerOptions) => {
    if (!containerRef.current) {
      console.error('Container ref not set')
      options.onError?.(0, 'Player container not found')
      return
    }
    
    volumeRef.current = options.volume || 75
    isMutedRef.current = options.muted || true
    retryCountRef.current = 0
    currentVideoIdRef.current = options.videoId
    
    try {
      await loadYouTubeAPI()
    } catch (err) {
      console.error('Failed to load YouTube API:', err)
      options.onError?.(0, err instanceof Error ? err.message : 'Failed to load YouTube API')
      return
    }
    
    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    } else {
      return
    }
    
    try {
      const playerId = `youtube-player-${Date.now()}`
      const playerDiv = document.createElement('div')
      playerDiv.id = playerId
      playerDiv.style.width = '100%'
      playerDiv.style.height = '100%'
      playerDiv.style.position = 'absolute'
      playerDiv.style.top = '0'
      playerDiv.style.left = '0'
      playerDiv.style.pointerEvents = 'none' // Disable all interactions
      containerRef.current.appendChild(playerDiv)
      
      if (!window.YT || !window.YT.Player) {
        throw new Error('YouTube API not available')
      }
      
      console.log('Creating player with video:', options.videoId)
      
      playerRef.current = new window.YT.Player(playerId, {
        videoId: options.videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          start: options.startSeconds || 0,
          playsinline: 1,
          origin: window.location.origin,
          enablejsapi: 1,
          cc_load_policy: 0,
          loop: 0
        },
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready - all controls hidden')
            
            try {
              event.target.setVolume(volumeRef.current)
              if (isMutedRef.current) {
                event.target.mute()
              } else {
                event.target.unMute()
              }
              
              // Start playing
              event.target.playVideo()
            } catch (err) {
              console.warn('Could not set volume:', err)
            }
            
            if (options.onTimeUpdate) {
              if (timeUpdateIntervalRef.current) {
                clearInterval(timeUpdateIntervalRef.current)
              }
              timeUpdateIntervalRef.current = setInterval(() => {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                  try {
                    const time = playerRef.current.getCurrentTime()
                    if (typeof time === 'number' && !isNaN(time)) {
                      options.onTimeUpdate?.(time)
                    }
                  } catch (err) {
                    // Ignore
                  }
                }
              }, 100)
            }
            
            options.onReady?.(event.target)
          },
          onStateChange: (event: any) => {
            options.onStateChange?.(event.data)
          },
          onError: (event: any) => {
            const errorCode = event.data
            const errorMessage = YT_ERRORS[errorCode as keyof typeof YT_ERRORS] || `Unknown error (${errorCode})`
            console.error(`YouTube error ${errorCode}:`, errorMessage)
            
            // Handle embedding errors - switch to working video
            if (errorCode === 101 || errorCode === 150 || errorCode === 100) {
              retryCountRef.current++
              
              if (retryCountRef.current <= maxRetries) {
                const workingVideoId = getWorkingVideo()
                console.log(`Switching to working video: ${workingVideoId} (attempt ${retryCountRef.current})`)
                
                setTimeout(() => {
                  if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
                    playerRef.current.loadVideoById(workingVideoId, 0)
                    currentVideoIdRef.current = workingVideoId
                  }
                }, 1000)
              } else {
                options.onError?.(errorCode, 'Could not load any video')
              }
            } else {
              options.onError?.(errorCode, errorMessage)
            }
          }
        }
      })
    } catch (err) {
      console.error('Error creating player:', err)
      options.onError?.(0, err instanceof Error ? err.message : 'Failed to create player')
    }
  }, [loadYouTubeAPI, getWorkingVideo])
  
  /**
   * Load video
   */
  const loadVideo = useCallback((videoId: string, startSeconds?: number) => {
    if (!playerRef.current) {
      console.warn('Player not ready')
      return false
    }
    
    try {
      console.log('Loading video:', videoId)
      currentVideoIdRef.current = videoId
      
      if (typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById({
          videoId,
          startSeconds: startSeconds || 0
        })
        return true
      }
    } catch (err) {
      console.error('Error loading video:', err)
    }
    return false
  }, [])
  
  /**
   * Set volume
   */
  const setVolume = useCallback((volume: number) => {
    if (!playerRef.current) return
    
    try {
      const safeVolume = Math.max(0, Math.min(100, volume))
      volumeRef.current = safeVolume
      
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      
      if (isIOS) {
        if (safeVolume === 0) {
          if (typeof playerRef.current.mute === 'function') {
            playerRef.current.mute()
          }
        } else {
          if (typeof playerRef.current.unMute === 'function') {
            playerRef.current.unMute()
          }
        }
      } else {
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(safeVolume)
        }
        
        if (safeVolume > 0 && isMutedRef.current) {
          if (typeof playerRef.current.unMute === 'function') {
            playerRef.current.unMute()
          }
          isMutedRef.current = false
        }
      }
    } catch (err) {
      console.error('Error setting volume:', err)
    }
  }, [])
  
  /**
   * Set muted
   */
  const setMuted = useCallback((muted: boolean) => {
    if (!playerRef.current) return
    
    try {
      isMutedRef.current = muted
      
      if (muted) {
        if (typeof playerRef.current.mute === 'function') {
          playerRef.current.mute()
        }
      } else {
        if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute()
        }
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(volumeRef.current)
        }
      }
    } catch (err) {
      console.error('Error setting mute:', err)
    }
  }, [])
  
  /**
   * Play video
   */
  const play = useCallback(() => {
    if (!playerRef.current) return false
    
    try {
      if (typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo()
        return true
      }
    } catch (err) {
      console.error('Error playing video:', err)
    }
    return false
  }, [])
  
  /**
   * Seek to time
   */
  const seekTo = useCallback((seconds: number, allowSeekAhead: boolean = true) => {
    if (!playerRef.current) return false
    
    try {
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seconds, allowSeekAhead)
        return true
      }
    } catch (err) {
      console.error('Error seeking:', err)
    }
    return false
  }, [])
  
  /**
   * Get current time
   */
  const getCurrentTime = useCallback((): number => {
    if (!playerRef.current) return 0
    
    try {
      if (typeof playerRef.current.getCurrentTime === 'function') {
        const time = playerRef.current.getCurrentTime()
        return typeof time === 'number' && !isNaN(time) ? time : 0
      }
    } catch (err) {
      console.error('Error getting current time:', err)
    }
    return 0
  }, [])
  
  /**
   * Get player state
   */
  const getPlayerState = useCallback((): number | null => {
    if (!playerRef.current) return null
    
    try {
      if (typeof playerRef.current.getPlayerState === 'function') {
        return playerRef.current.getPlayerState()
      }
    } catch (err) {
      console.error('Error getting player state:', err)
    }
    return null
  }, [])
  
  /**
   * Check if player is ready
   */
  const isReady = useCallback((): boolean => {
    return !!playerRef.current && apiReadyRef.current
  }, [])
  
  /**
   * Destroy player
   */
  const destroy = useCallback(() => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current)
      timeUpdateIntervalRef.current = null
    }
    
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy()
      } catch (err) {
        console.error('Error destroying player:', err)
      }
    }
    
    playerRef.current = null
    apiReadyRef.current = false
    apiLoadingRef.current = false
  }, [])
  
  useEffect(() => {
    return () => {
      destroy()
    }
  }, [destroy])
  
  return {
    containerRef,
    initializePlayer,
    loadVideo,
    setVolume,
    setMuted,
    play,
    seekTo,
    getCurrentTime,
    getPlayerState,
    isReady,
    destroy
  }
}