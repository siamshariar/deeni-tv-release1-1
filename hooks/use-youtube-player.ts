import { useRef, useCallback, useEffect } from 'react'

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
  onDurationChange?: (duration: number) => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function useYouTubePlayer() {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const apiReadyRef = useRef<boolean>(false)
  const isMutedRef = useRef<boolean>(true)
  const volumeRef = useRef<number>(75)
  const durationRef = useRef<number>(0)
  const videoIdRef = useRef<string>('')
  
  const loadYouTubeAPI = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) {
        apiReadyRef.current = true
        resolve()
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('YouTube API failed to load'))
      }, 10000)
      
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.head.appendChild(script)
      
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timeout)
        apiReadyRef.current = true
        resolve()
      }
    })
  }, [])
  
  const initializePlayer = useCallback(async (options: YouTubePlayerOptions) => {
    if (!containerRef.current) return
    
    volumeRef.current = options.volume || 75
    isMutedRef.current = options.muted || true
    videoIdRef.current = options.videoId
    
    try {
      await loadYouTubeAPI()
    } catch (err) {
      options.onError?.(0, 'Failed to load YouTube API')
      return
    }
    
    containerRef.current.innerHTML = ''
    
    try {
      const playerId = `youtube-player-${Date.now()}`
      const playerDiv = document.createElement('div')
      playerDiv.id = playerId
      playerDiv.style.width = '100%'
      playerDiv.style.height = '100%'
      playerDiv.style.position = 'absolute'
      playerDiv.style.top = '0'
      playerDiv.style.left = '0'
      containerRef.current.appendChild(playerDiv)
      
      playerRef.current = new window.YT.Player(playerId, {
        videoId: options.videoId,
        playerVars: {
          autoplay: 1,
          mute: options.muted ? 1 : 0,
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
          enablejsapi: 1
        },
        events: {
          onReady: (event: any) => {
            try {
              event.target.setVolume(volumeRef.current)
              if (isMutedRef.current) {
                event.target.mute()
              } else {
                event.target.unMute()
              }
              
              // Get video duration from YouTube API
              const duration = event.target.getDuration()
              if (duration && !isNaN(duration) && duration > 0) {
                durationRef.current = duration
                options.onDurationChange?.(duration)
              }
            } catch (err) {}
            options.onReady?.(event.target)
          },
          onStateChange: (event: any) => {
            // When video is cued or playing, get duration
            if (event.data === YT_STATE.CUED || event.data === YT_STATE.PLAYING) {
              try {
                const duration = event.target.getDuration()
                if (duration && !isNaN(duration) && duration > 0 && duration !== durationRef.current) {
                  durationRef.current = duration
                  options.onDurationChange?.(duration)
                }
              } catch (err) {}
            }
            options.onStateChange?.(event.data)
          },
          onError: (event: any) => {
            options.onError?.(event.data, `Error ${event.data}`)
          }
        }
      })
    } catch (err) {
      options.onError?.(0, 'Failed to create player')
    }
  }, [loadYouTubeAPI])
  
  const loadVideo = useCallback((videoId: string, startSeconds?: number) => {
    if (!playerRef.current) return false
    
    try {
      videoIdRef.current = videoId
      if (typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById({
          videoId,
          startSeconds: startSeconds || 0
        })
        
        // Try to get duration after load
        setTimeout(() => {
          try {
            const duration = playerRef.current.getDuration()
            if (duration && !isNaN(duration) && duration > 0) {
              durationRef.current = duration
            }
          } catch (err) {}
        }, 500)
        
        return true
      }
    } catch (err) {
      console.error('Error loading video:', err)
    }
    return false
  }, [])
  
  const getDuration = useCallback((): number => {
    if (!playerRef.current) return 0
    try {
      const duration = playerRef.current.getDuration()
      return typeof duration === 'number' && !isNaN(duration) ? duration : 0
    } catch (err) {
      return durationRef.current
    }
  }, [])
  
  const setVolume = useCallback((volume: number) => {
    if (!playerRef.current) return
    
    try {
      const safeVolume = Math.max(0, Math.min(100, volume))
      volumeRef.current = safeVolume
      
      if (typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(safeVolume)
      }
    } catch (err) {}
  }, [])
  
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
      }
    } catch (err) {}
  }, [])
  
  const play = useCallback(() => {
    if (!playerRef.current) return false
    try {
      if (typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo()
        return true
      }
    } catch (err) {}
    return false
  }, [])
  
  const seekTo = useCallback((seconds: number, allowSeekAhead: boolean = true) => {
    if (!playerRef.current) return false
    try {
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seconds, allowSeekAhead)
        return true
      }
    } catch (err) {}
    return false
  }, [])
  
  const getCurrentTime = useCallback((): number => {
    if (!playerRef.current) return 0
    try {
      const time = playerRef.current.getCurrentTime()
      return typeof time === 'number' && !isNaN(time) ? time : 0
    } catch (err) {}
    return 0
  }, [])
  
  const destroy = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy()
      } catch (err) {}
    }
    playerRef.current = null
    apiReadyRef.current = false
    durationRef.current = 0
  }, [])
  
  useEffect(() => {
    return () => { destroy() }
  }, [destroy])
  
  return {
    containerRef,
    initializePlayer,
    loadVideo,
    getDuration,
    setVolume,
    setMuted,
    play,
    seekTo,
    getCurrentTime,
    destroy
  }
}
