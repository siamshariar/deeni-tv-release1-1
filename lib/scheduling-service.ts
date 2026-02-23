import { getUpcomingPrograms, checkScheduledPreloads, ScheduledPreload } from './schedule-utils'

type PreloadCallback = (preload: { programId: string; videoId: string }) => void
type SwitchCallback = (programId: string) => void

class SchedulingService {
  private static instance: SchedulingService
  private preloadTimers: Map<string, NodeJS.Timeout> = new Map()
  private switchTimers: Map<string, NodeJS.Timeout> = new Map()
  private preloadCallbacks: PreloadCallback[] = []
  private switchCallbacks: SwitchCallback[] = []
  private checkInterval: NodeJS.Timeout | null = null
  private lastCheckTime: number = 0
  private processedPreloads: Set<string> = new Set()
  
  private constructor() {
    // Only start monitoring in browser environment
    if (typeof window !== 'undefined') {
      this.startMonitoring()
    }
  }
  
  static getInstance(): SchedulingService {
    if (!SchedulingService.instance) {
      SchedulingService.instance = new SchedulingService()
    }
    return SchedulingService.instance
  }
  
  /**
   * Start monitoring for preload schedules
   */
  private startMonitoring(): void {
    // Check every second for due preloads
    this.checkInterval = setInterval(() => {
      this.checkSchedules()
    }, 1000)
  }
  
  /**
   * Check for due preloads
   */
  private checkSchedules(): void {
    const now = Date.now()
    
    if (now - this.lastCheckTime < 100) return // Prevent too frequent checks
    this.lastCheckTime = now
    
    const duePreloads = checkScheduledPreloads()
    
    duePreloads.forEach((preload: ScheduledPreload) => {
      const preloadKey = `${preload.programId}-${preload.preloadTime}`
      
      if (this.processedPreloads.has(preloadKey)) return
      
      this.processedPreloads.add(preloadKey)
      
      // Clean up old entries
      if (this.processedPreloads.size > 100) {
        const entries = Array.from(this.processedPreloads)
        const toRemove = entries.slice(0, entries.length - 100)
        toRemove.forEach(key => this.processedPreloads.delete(key))
      }
      
      console.log(`⏰ 5-minute preload triggered for program ${preload.programId}`)
      
      // Notify preload callbacks
      this.preloadCallbacks.forEach(callback => {
        try {
          callback({ programId: preload.programId, videoId: preload.videoId })
        } catch (err) {
          console.error('Error in preload callback:', err)
        }
      })
    })
  }
  
  /**
   * Schedule a program switch (called when program ends)
   */
  public scheduleSwitch(programId: string, switchTime: number, videoId: string): void {
    const now = Date.now()
    const delay = switchTime - now
    
    if (delay <= 0) {
      // Already due, execute immediately
      this.switchCallbacks.forEach(callback => callback(programId))
      return
    }
    
    // Clear any existing timer for this program
    if (this.switchTimers.has(programId)) {
      clearTimeout(this.switchTimers.get(programId)!)
    }
    
    const timer = setTimeout(() => {
      console.log(`🔄 Switching to program ${programId}`)
      this.switchCallbacks.forEach(callback => callback(programId))
      this.switchTimers.delete(programId)
    }, delay)
    
    this.switchTimers.set(programId, timer)
    console.log(`Scheduled switch to ${programId} in ${Math.round(delay/1000)}s`)
  }
  
  /**
   * Schedule all upcoming preloads and switches
   */
  public scheduleAll(): void {
    const { scheduledPreloads } = getUpcomingPrograms('bangla-1', 20)
    
    // Clear old timers
    this.preloadTimers.forEach(timer => clearTimeout(timer))
    this.preloadTimers.clear()
    
    // Schedule preloads
    scheduledPreloads.forEach((preload: ScheduledPreload) => {
      const now = Date.now()
      const delay = preload.preloadTime - now
      
      if (delay <= 0) return
      
      const timer = setTimeout(() => {
        console.log(`⏰ Preloading ${preload.videoId} for ${preload.programId}`)
        this.preloadCallbacks.forEach(callback => 
          callback({ programId: preload.programId, videoId: preload.videoId })
        )
        this.preloadTimers.delete(preload.programId)
      }, delay)
      
      this.preloadTimers.set(preload.programId, timer)
    })
    
    console.log(`Scheduled ${scheduledPreloads.length} preloads`)
  }
  
  /**
   * Register preload callback
   */
  public onPreload(callback: PreloadCallback): () => void {
    this.preloadCallbacks.push(callback)
    return () => {
      this.preloadCallbacks = this.preloadCallbacks.filter(cb => cb !== callback)
    }
  }
  
  /**
   * Register switch callback
   */
  public onSwitch(callback: SwitchCallback): () => void {
    this.switchCallbacks.push(callback)
    return () => {
      this.switchCallbacks = this.switchCallbacks.filter(cb => cb !== callback)
    }
  }
  
  /**
   * Stop all timers
   */
  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    
    this.preloadTimers.forEach(timer => clearTimeout(timer))
    this.switchTimers.forEach(timer => clearTimeout(timer))
    this.preloadTimers.clear()
    this.switchTimers.clear()
    this.preloadCallbacks = []
    this.switchCallbacks = []
    this.processedPreloads.clear()
  }
  
  /**
   * Reset service
   */
  public reset(): void {
    this.destroy()
    if (typeof window !== 'undefined') {
      this.startMonitoring()
    }
  }
}

// Export the singleton instance
export const schedulingService = SchedulingService.getInstance()

// Also export the class for testing if needed
export { SchedulingService }