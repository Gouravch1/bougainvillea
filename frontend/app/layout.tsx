import React from "react"
import type { Metadata } from 'next'
import { Manrope, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: '--font-manrope'
});

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: '--font-cormorant'
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains'
});

export const metadata: Metadata = {
  title: 'Bougainvillea WatchParty — Watch together. Feel closer.',
  description: 'A cinematic watch room for the people you love, wherever they are.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${cormorant.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
