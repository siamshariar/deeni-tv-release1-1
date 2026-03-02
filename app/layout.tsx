
import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-geist',
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-geist-mono',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://deeni.tv'),
  title: {
    default: 'Deeni.tv - Your Spiritual TV Experience',
    template: '%s | Deeni.tv'
  },
  description: 'Experience premium spiritual content in a cinematic lean-back TV interface. Watch Islamic lectures, Ramadan guides, and more in a synchronized TV-like experience.',
  generator: 'Next.js',
  applicationName: 'Deeni.tv',
  referrer: 'origin-when-cross-origin',
  keywords: ['Islamic TV', 'Spiritual content', 'Ramadan guide', 'Islamic lectures', 'Dr. Abdullah Jahangir', 'Bengali lectures'],
  authors: [{ name: 'Deeni.tv Team' }],
  creator: 'Deeni.tv',
  publisher: 'Deeni.tv',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
      { url: '/favicon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon-256x256.png', type: 'image/png', sizes: '256x256' },
    ],
    apple: [
      { url: '/favicon-180x180.png', sizes: '180x180', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-256x256.png', sizes: '256x256', type: 'image/png' },
      { url: '/favicon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#13b589',
      },
    ],
  },
  
  manifest: '/manifest.json',
  
  openGraph: {
    title: 'Deeni.tv - Your Spiritual TV Experience',
    description: 'Experience premium spiritual content in a cinematic lean-back TV interface',
    url: 'https://deeni.tv',
    siteName: 'Deeni.tv',
    images: [
      {
        url: '/favicon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Deeni.tv - Spiritual TV Experience',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Deeni.tv - Your Spiritual TV Experience',
    description: 'Experience premium spiritual content in a cinematic lean-back TV interface',
    images: ['/favicon-512x512.png'],
    creator: '@deenitv',
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  verification: {
    google: 'your-google-verification-code', // Add your verification code
    yandex: 'your-yandex-verification-code', // Add if needed
    yahoo: 'your-yahoo-verification-code', // Add if needed
  },
  
  category: 'religion',
  
  // PWA meta tags
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Deeni.tv',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#000000',
    'msapplication-tap-highlight': 'no',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html 
      lang="en" 
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="manifest" href="/manifest.webmanifest" />
        
        {/* Favicons - using provided favicon-*.png files */}
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/favicon-256x256.png" />
        <link rel="icon" type="image/png" sizes="384x384" href="/favicon-384x384.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/favicon-180x180.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="apple-touch-icon" sizes="256x256" href="/favicon-256x256.png" />
        <link rel="apple-touch-icon" sizes="384x384" href="/favicon-384x384.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/favicon-512x512.png" />
        
        {/* Apple Startup Images */}
        <link rel="apple-touch-startup-image" href="/favicon-512x512.png" />
        
        {/* Safari Pinned Tab */}
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#13b589" />
        
        {/* MS Application */}
        <meta name="msapplication-TileImage" content="/favicon-256x256.png" />
        <meta name="msapplication-TileColor" content="#13b589" />
        
        {/* PWA Compatibility */}
        <script
          async
          src="https://cdn.jsdelivr.net/npm/pwacompat"
          crossOrigin="anonymous"
        />
      </head>
      <body 
        className="font-sans antialiased bg-zinc-950 text-white"
        suppressHydrationWarning={true}
      >
        <div id="root">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
