"use client"

import {
  ChatTeardropTextIcon,
  DatabaseIcon,
  FileMagnifyingGlassIcon,
  MaskHappyIcon,
  OpenAiLogoIcon,
  PawPrintIcon,
  VectorThreeIcon,
} from "@phosphor-icons/react"
import type { ReactNode } from "react"
import { Plate } from "./dock"
import type { Tech } from "./stack-data"

function Microsoft() {
  return (
    <svg viewBox="0 0 23 23" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  )
}

const SUBSTITUTES: Record<string, ReactNode> = {
  "c#": <Microsoft />,
  "sql server": <Microsoft />,
  azure: <Microsoft />,
  "azure openai": <OpenAiLogoIcon aria-hidden />,
  playwright: <MaskHappyIcon aria-hidden weight="fill" color="#2ead33" />,
  zustand: <PawPrintIcon aria-hidden weight="fill" color="#6b4a2f" />,
  sql: <DatabaseIcon aria-hidden weight="fill" color="#475569" />,
  rag: <FileMagnifyingGlassIcon aria-hidden weight="bold" />,
  "prompt eng.": <ChatTeardropTextIcon aria-hidden weight="bold" />,
  embeddings: <VectorThreeIcon aria-hidden weight="bold" />,
}

function colorLight(hex: string): boolean {
  const channel = (i: number) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4) > 0.55
}

export function BrandMark({ tech }: { tech: Tech }) {
  if (tech.path && tech.color) {
    return (
      <Plate tone={colorLight(tech.color) ? "dark" : "light"}>
        <svg viewBox="0 0 24 24" fill={`#${tech.color}`} aria-hidden>
          <path d={tech.path} />
        </svg>
      </Plate>
    )
  }
  const substitute = SUBSTITUTES[tech.name]
  if (substitute) return <Plate>{substitute}</Plate>

  return (
    <Plate>
      <span className="st-plate-chars font-mono">{tech.name.slice(0, 2)}</span>
    </Plate>
  )
}
