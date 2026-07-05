"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => (
  <>
    <style>{`
      [data-sonner-toast] {
        gap: 12px !important;
        padding: 12px 16px !important;
        min-width: 320px !important;
        background: var(--bg-surface) !important;
        border: 1px solid var(--border-subtle) !important;
        border-left-width: 2px !important;
        border-left-color: var(--border-strong) !important;
        border-radius: var(--radius-md) !important;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5) !important;
        color: var(--fg-primary) !important;
      }
      [data-sonner-toast] [data-title] {
        font-family: var(--font-mono) !important;
        font-size: 13px !important;
        color: var(--fg-primary) !important;
      }
      [data-sonner-toast] [data-description] {
        font-family: var(--font-sans) !important;
        font-size: 12px !important;
        line-height: 1.5 !important;
        color: var(--fg-secondary) !important;
      }
      [data-sonner-toast] [data-button] {
        font-family: var(--font-mono) !important;
        font-size: 12px !important;
        color: var(--fg-brand) !important;
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        cursor: pointer !important;
      }
      [data-sonner-toast][data-type="success"] {
        border-left-color: var(--status-success) !important;
      }
      [data-sonner-toast][data-type="error"] {
        border-left-color: var(--status-error) !important;
      }
      [data-sonner-toast][data-type="warning"] {
        border-left-color: var(--status-warning) !important;
      }
      [data-sonner-toast][data-type="info"] {
        border-left-color: var(--status-info) !important;
      }
    `}</style>
    <Sonner theme="dark" className="toaster group" {...props} />
  </>
)

export { Toaster }
export { toast } from "sonner"
