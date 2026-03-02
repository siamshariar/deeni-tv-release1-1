'use client'

import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const DONATION_URL = 'https://www.deeniinfotech.com/donate#donation-form'

// Deeni.tv Official Logo
const DONATION_LOGO_URL = '/App_logo_384.png'

export function DonateButton() {
  const handleDonate = () => {
    window.open(DONATION_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center">
      {/* Donate Button - Shows on all screens including mobile */}
      <Button
        size="lg"
        onClick={handleDonate}
        className="
          bg-gradient-to-r from-primary to-primary/80 
          hover:from-primary/90 hover:to-primary/70 
          hover:scale-105 hover:shadow-xl hover:shadow-primary/30
          text-primary-foreground shadow-lg font-semibold 
           py-2 md:py-3 rounded-full gap-0 px-3 md:px-3
          transition-all duration-300 ease-out
          group cursor-pointer flex items-center justify-center
        "
      >
        {/* Deeni.tv Logo */}
        <div className="relative py-2 h-20 w-20 rounded-lg flex items-center justify-center overflow-hidden">
          <Image
            src={DONATION_LOGO_URL}
            alt="Deeni.tv"
            width={56}
            height={56}
            className="h-full w-full object-contain"
            onError={(e) => {
              // Fallback to Heart icon if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5 md:h-6 md:w-6 text-white"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>'
              }
            }}
          />
        </div>
        <span className="text-sm md:text-base font-bold">Donate</span>
      </Button>
    </div>
  )
}
