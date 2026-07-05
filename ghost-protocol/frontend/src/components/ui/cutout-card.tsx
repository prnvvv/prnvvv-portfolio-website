"use client"

import { createContext, useContext, type ComponentProps } from "react"
import { motion, type Variants } from "motion/react"
import { cn } from "@/lib/utils"

const CUTOUT_SIZE = 12

const CutoutCardContext = createContext<{ id: string }>({ id: "cutout" })

export function useCutoutContentStaggerVariants() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }
  const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  }
  return { container, item }
}

export const cutoutCardSurfaceClassName =
  "bg-black/55 backdrop-blur-md border border-[#00e67a]/15"

function CutoutCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <CutoutCardContext.Provider value={{ id: "cutout" }}>
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-lg",
          className
        )}
        {...props}
      />
    </CutoutCardContext.Provider>
  )
}

function CutoutCardMedia({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      {...props}
    />
  )
}

function CutoutCardImage({ className, alt, ...props }: ComponentProps<"img">) {
  return (
    <img
      className={cn("h-full w-full object-cover", className)}
      alt={alt}
      {...props}
    />
  )
}

function CutoutCardOverlay({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-gradient-to-t from-[#0d0d14]/70 via-transparent to-transparent",
        className
      )}
      {...props}
    />
  )
}

function CutoutCardInsetLabel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("absolute", className)}
      {...props}
    />
  )
}

function CutoutCardPin({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("absolute", className)}
      {...props}
    />
  )
}

function CutoutCardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 p-0", className)}
      {...props}
    />
  )
}

function CutoutCardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function CutoutCardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("absolute", className)}
      {...props}
    />
  )
}

function CutoutCorner({
  className,
  size = CUTOUT_SIZE,
  ...props
}: ComponentProps<"svg"> & { size?: number }) {
  const s = size
  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="currentColor"
      className={cn("pointer-events-none shrink-0", className)}
      {...props}
    >
      <path d={`M0 0 L${s} 0 L${s} ${s} Z`} />
    </svg>
  )
}

export {
  CutoutCard,
  CutoutCardAction,
  CutoutCardContent,
  CutoutCardFooter,
  CutoutCardImage,
  CutoutCardInsetLabel,
  CutoutCardMedia,
  CutoutCardOverlay,
  CutoutCardPin,
  CutoutCorner,
}
