"use client"

import type React from "react"

import { useState, useEffect, useRef, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CarouselProps {
  children: ReactNode[]
  currentIndex: number
  onIndexChange: (index: number) => void
}

export function Carousel({ children, currentIndex, onIndexChange }: CarouselProps) {
  const [isSwiping, setIsSwiping] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < children.length - 1) {
      onIndexChange(currentIndex + 1)
    }
  }

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsSwiping(true)
    if ("touches" in e) {
      setStartX(e.touches[0].clientX)
      setCurrentX(e.touches[0].clientX)
    } else {
      setStartX(e.clientX)
      setCurrentX(e.clientX)
    }
  }

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwiping) return

    if ("touches" in e) {
      setCurrentX(e.touches[0].clientX)
    } else {
      setCurrentX(e.clientX)
    }
  }

  const handleTouchEnd = () => {
    if (!isSwiping) return

    const diff = startX - currentX
    const threshold = 100 // minimum distance to trigger a swipe

    if (diff > threshold && currentIndex < children.length - 1) {
      // Swiped left, go to next
      onIndexChange(currentIndex + 1)
    } else if (diff < -threshold && currentIndex > 0) {
      // Swiped right, go to previous
      onIndexChange(currentIndex - 1)
    }

    setIsSwiping(false)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        // Only left mouse button
        setIsSwiping(true)
        setStartX(e.clientX)
        setCurrentX(e.clientX)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSwiping) return
      setCurrentX(e.clientX)
    }

    const handleMouseUp = () => {
      handleTouchEnd()
    }

    container.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      container.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isSwiping, startX, currentX, currentIndex, children.length, onIndexChange])

  // Calculate the offset for the swipe animation
  const getTranslateX = () => {
    if (!isSwiping) return -currentIndex * 100

    const containerWidth = containerRef.current?.offsetWidth || 1
    const dragOffset = ((currentX - startX) / containerWidth) * 100
    return -currentIndex * 100 + dragOffset
  }

  return (
    <div className="relative h-full overflow-hidden" ref={containerRef}>
      <div
        className="flex h-full transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(${isSwiping ? getTranslateX() : -currentIndex * 100}%)`,
          width: `${children.length * 100}%`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, index) => (
          <div key={index} className="flex-shrink-0" style={{ width: `${100 / children.length}%` }}>
            {child}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 flex justify-between w-full px-4 pointer-events-none">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-background shadow-md pointer-events-auto transition-transform hover:scale-110"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-background shadow-md pointer-events-auto transition-transform hover:scale-110"
          onClick={handleNext}
          disabled={currentIndex === children.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
