"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/app/components/entrepta/skeleton"

const GithubCalendarInner = dynamic(
  () => import("@/components/about/github-calendar").then((m) => m.GithubCalendar),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[112px] w-full rounded-lg" />,
  },
)

export function GithubCard({ username }: { username: string }) {
  return <GithubCalendarInner username={username} />
}
