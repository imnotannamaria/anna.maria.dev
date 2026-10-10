"use client"

import type { ReactNode } from "react"
import { useNavigate } from "../../site-frame"
import type { PageId } from "../pages"

export function Door({
  to,
  label,
  className,
  children,
}: {
  to: PageId

  label: string
  className?: string
  children: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className={className}
      aria-label={`Go to ${label}`}
      onClick={() => navigate(to)}
    >
      {children}
    </button>
  )
}
