'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { loadLatestSnapshot } from '@/lib/supabaseService'

export default function LandingPage() {
  const [isChecking, setIsChecking] = useState(true)
  const [hasPublishedData, setHasPublished] = useState(false)
  const [latestSlug, setLatestSlug] = useState(null)

  useEffect(() => {
    loadLatestSnapshot()
      .then((snap) => {
        if (snap) {
          setHasPublished(true)
          setLatestSlug(snap.slug)
        }
      })
      .catch(() => {
        // Supabase down — silently hide View Dashboard
      })
      .finally(() => setIsChecking(false))
  }, [])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const viewBtnClass = `
    block w-full text-center
    bg-gray-900 dark:bg-white
    text-white dark:text-gray-900
    px-6 py-3 rounded-xl
    text-sm font-medium
    hover:opacity-90 transition-opacity duration-150
  `

  const adminBtnClassPrimary = `
    block w-full text-center
    bg-gray-900 dark:bg-white
    text-white dark:text-gray-900
    px-6 py-3 rounded-xl
    text-sm font-medium
    hover:opacity-90 transition-opacity duration-150
  `

  const adminBtnClassSecondary = `
    block w-full text-center
    bg-white dark:bg-gray-900
    text-gray-700 dark:text-gray-300
    border border-gray-200 dark:border-gray-700
    px-6 py-3 rounded-xl
    text-sm font-medium
    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150
  `

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 px-6">

      {/* Logo */}
      <div className="mb-5 l">
        <Image
          src="/logo.jpeg"
          alt="Panda Hub"
          width={240}
          height={240}
          priority
          className="object-contain rounded-4xl"
        />
      </div>

    

      {/* Subtitle */}
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        Panda Frequency Dashboard
      </p>

      {/* Description */}
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-xs mb-10">
        Analytics for your car detailing marketplace — powered by your Stripe data
      </p>

      {/* Buttons */}
      <div className="flex flex-col w-full max-w-xs gap-3">
        {hasPublishedData && (
          <a
            href={`/view/${latestSlug}`}
            className={viewBtnClass}
          >
            View Dashboard →
          </a>
        )}

        <a
          href="/admin"
          className={
            hasPublishedData
              ? adminBtnClassSecondary
              : adminBtnClassPrimary
          }
        >
          Go to Admin Panel →
        </a>
      </div>

    </div>
  )
}