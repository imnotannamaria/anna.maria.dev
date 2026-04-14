"use client"

import { useState } from "react"
import { CheckCircleIcon, WarningCircleIcon, CircleNotchIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type FormState = "idle" | "loading" | "success" | "error"

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState("loading")
    setErrorMessage("")

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setState("success")
      } else {
        const json = await res.json().catch(() => ({}))
        setErrorMessage(json.error ?? "Something went wrong. Please try again.")
        setState("error")
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.")
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div className="flex items-center gap-3 py-4">
        <CheckCircleIcon size={20} className="shrink-0 text-indigo-400" />
        <div>
          <p className="text-text-primary text-sm font-medium">Message sent!</p>
          <p className="text-text-secondary text-sm">
            Thanks for reaching out. I&apos;ll get back to you soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0 }}
      />

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-text-primary block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your name"
          disabled={state === "loading"}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-text-primary block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="your@email.com"
          disabled={state === "loading"}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-text-primary block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="What's on your mind?"
          disabled={state === "loading"}
          className={cn(inputClass, "resize-none")}
        />
      </div>

      {state === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <WarningCircleIcon size={15} className="shrink-0" />
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-400 active:translate-y-0 active:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {state === "loading" ? (
          <>
            <CircleNotchIcon size={15} className="animate-spin" />
            Sending…
          </>
        ) : (
          "Send message"
        )}
      </button>
    </form>
  )
}

const inputClass = cn(
  "w-full rounded-lg border border-border bg-bg-surface px-4 py-3 text-sm text-text-primary",
  "placeholder:text-text-muted",
  "transition-colors",
  "outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.15)]",
  "disabled:cursor-not-allowed disabled:opacity-60",
)
