"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [nextPathname, setNextPathname] = useState<string | null>(null)

  // Handle initial page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.classList.add("page-loaded")
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Handle page transitions
  useEffect(() => {
    setDisplayChildren(children)
  }, [children, pathname])

  // Custom navigation function to replace the original transitionToPage
  const transitionToPage = (path: string) => {
    if (path === pathname) return

    setIsTransitioning(true)
    setNextPathname(path)

    // Wait for the fade-out animation to complete
    setTimeout(() => {
      router.push(path)

      // Reset after navigation
      setTimeout(() => {
        setIsTransitioning(false)
        setNextPathname(null)
      }, 100)
    }, 300)
  }

  // Make the function available globally
  useEffect(() => {
    // @ts-ignore - Adding to window object
    window.transitionToPage = transitionToPage

    return () => {
      // @ts-ignore - Cleanup
      delete window.transitionToPage
    }
  }, [pathname, router])

  return <div className={`page-transition ${isTransitioning ? "fade-out" : "fade-in"}`}>{displayChildren}</div>
}
