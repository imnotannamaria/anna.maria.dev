/** PROTÓTIPO / DISCOVERY — board em colunas. Sem metadata, sem SEO, sem nada disso ainda. */

import { TypeIn } from "@/components/ui/type-in"
import { RoadmapBoard } from "@/components/roadmap/roadmap-board"

export default function RoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8 lg:px-11">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 font-mono text-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>~</span>
        <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
          /
        </span>
        <span style={{ color: "var(--fg-primary)" }}>roadmap</span>
      </nav>

      <header className="mb-8 border-b pb-7" style={{ borderColor: "var(--border-subtle)" }}>
        <div
          className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          <span style={{ color: "var(--fg-brand)" }}>$</span>{" "}
          <TypeIn text="cat ROADMAP.md --board" />
        </div>

        <h1
          className="font-serif text-[40px] leading-none font-normal tracking-[-0.02em] sm:text-5xl lg:text-[64px]"
          style={{ color: "var(--fg-primary)" }}
        >
          Roadmap
        </h1>

        <p
          className="mt-4 max-w-[58ch] font-sans text-base leading-relaxed"
          style={{ color: "var(--fg-secondary)" }}
        >
          Tudo que eu quero fazer com este site, e o que já{" "}
          <em className="font-serif italic" style={{ color: "var(--fg-brand)" }}>
            saiu
          </em>
          . Nada aqui tem data — um item é um pensamento que eu não quis perder.
        </p>

        <p className="mt-3 font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
          {"// marque um card e ele voa pra coluna certa. protótipo, não salva."}
        </p>
      </header>

      <RoadmapBoard />
    </div>
  )
}
