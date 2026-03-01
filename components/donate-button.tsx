'use client'

import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const DONATION_URL = 'https://www.deeniinfotech.com/donate#donation-form'

// Placeholder logo URL - replace with actual logo from info section
const DONATION_LOGO_URL = '/placeholder-logo.svg'

export function DonateButton() {
  const handleDonate = () => {
    window.open(DONATION_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      {/* Donate Button - Shows on all screens including mobile */}
      <Button
        size="lg"
        onClick={handleDonate}
        className="
          bg-gradient-to-r from-primary to-primary/80 
          hover:from-primary/90 hover:to-primary/70 
          hover:scale-105 hover:shadow-xl hover:shadow-primary/30
          text-primary-foreground shadow-lg font-semibold 
          px-3 md:px-5 py-2 md:py-3 rounded-full 
          transition-all duration-300 ease-out
          group
        "
      >
        {/* Donation Logo - Placeholder image for now */}
        <div className="relative mr-1.5 md:mr-2 h-6 w-6 md:h-8 md:w-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden group-hover:bg-white/30 transition-colors">
          <Image
            src={DONATION_LOGO_URL}
            alt="Donate"
            width={32}
            height={32}
            className="h-full w-full object-contain"
            onError={(e) => {
              // Fallback to Heart icon if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 md:h-5 md:w-5 text-white"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>'
              }
            }}
          />
        </div>
        <span className="text-sm md:text-base font-bold">Donate</span>
      </Button>
    </div>
  )
}
