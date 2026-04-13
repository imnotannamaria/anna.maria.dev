"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

export function TagFilter({ tags }: { tags: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get("tag")

  function handleTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (active === tag) {
      params.delete("tag")
    } else {
      params.set("tag", tag)
    }
    router.push(`/contributions?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTag(tag)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            active === tag
              ? "bg-indigo-500 text-white"
              : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary border",
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
