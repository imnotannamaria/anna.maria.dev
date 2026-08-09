/**
 * PROTÓTIPO / DISCOVERY — dados chumbados na mão.
 *
 * A ideia final é ler ROADMAP.md (parse dos `## ` + um marcador de status por
 * item, ou frontmatter via Velite). Aqui é só uma lista pra ver a coisa em pé.
 */

export type RoadmapStatus = "todo" | "doing" | "done"

export type RoadmapItem = {
  id: string
  title: string
  blurb: string
  status: RoadmapStatus
  /** link opcional pro plano em docs/ */
  plan?: string
}

export const ROADMAP_STATUS: Record<
  RoadmapStatus,
  { label: string; command: string; mark: string }
> = {
  todo: { label: "To do", command: "$ ls roadmap/todo", mark: "[ ]" },
  doing: { label: "In progress", command: "$ ls roadmap/doing", mark: "[~]" },
  done: { label: "Shipped", command: "$ ls roadmap/done", mark: "[x]" },
}

export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: "sidebar-job",
    title: "Give the sidebar a job",
    blurb:
      "Hoje ele repete as tabs do titlebar. Quero que segure o que não cabe numa página: comentários, o roadmap. Tabs saindo da borda, um painel desliza.",
    status: "doing",
  },
  {
    id: "roadmap-component",
    title: "Roadmap component",
    blurb: "Um lugar que lê este arquivo e mostra os itens, riscando o que já saiu.",
    status: "doing",
  },
  {
    id: "home-components",
    title: "Home components",
    blurb:
      "Alguns componentes estão sem graça. Primeiro da fila: o card de experiência vira uma árvore de arquivos navegável.",
    status: "doing",
    plan: "docs/tree-plan.md",
  },

  {
    id: "animations",
    title: "Animations",
    blurb: "Animar os widgets da home pro site parecer vivo. Algo com efeito de wow.",
    status: "todo",
  },
  {
    id: "cursor",
    title: "A cursor of my own",
    blurb:
      "Trocar a setinha do sistema por uma marca que pertence ao site — cresce num link, talvez deixe rastro.",
    status: "todo",
  },
  {
    id: "card-states",
    title: "A state for every card",
    blurb:
      "Cada card que lê o banco quer seu skeleton e seu erro. Um card que quebrou devia dizer que quebrou, não ficar vazio.",
    status: "todo",
  },
  {
    id: "feed",
    title: "Posts and (or) projects as a feed",
    blurb: "Uma coluna, um item por card, mais novo primeiro. Talvez os dois no mesmo feed.",
    status: "todo",
  },
  {
    id: "contributions-rewrite",
    title: "Rewrite the contributions graph",
    blurb: "Sair do react-github-calendar e montar da API do GitHub, pros quadradinhos serem meus.",
    status: "todo",
  },
  {
    id: "comments",
    title: "Comments",
    blurb:
      "A versão Figma: aponta pra um card, larga um pin, escreve ali. O comentário pertence à coisa, não a um form no rodapé.",
    status: "todo",
  },
  {
    id: "tipfy",
    title: "tipfy",
    blurb: "Refactor: email a cada recomendação, mover pro Supabase, proteger o form.",
    status: "todo",
  },
  {
    id: "favicon",
    title: "Better favicon",
    blurb: "A atual é simples demais. Quero sentar, estudar um pouco e fazer melhor.",
    status: "todo",
  },

  {
    id: "log",
    title: "/log",
    blurb: "Um feed só pra tudo que eu termino — filmes, séries, livros, álbuns, podcasts, jogos.",
    status: "done",
    plan: "docs/log-plan.md",
  },
  {
    id: "wristkit",
    title: "wristkit card",
    blurb: "Os anéis do Apple Watch na home, alimentados por um Shortcut que empurra pro Postgres.",
    status: "done",
  },
  {
    id: "admin",
    title: "Admin behind AuthKit",
    blurb: "CRUD do log atrás do WorkOS mais uma allowlist de email checada na rota.",
    status: "done",
  },
]

export function itemsByStatus(status: RoadmapStatus) {
  return ROADMAP_ITEMS.filter((item) => item.status === status)
}
