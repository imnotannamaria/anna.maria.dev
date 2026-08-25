export type ProjectKind = "library" | "demo"

/** Card head label, left side — replaces the old static "project". */
export const KIND_LABEL: Record<ProjectKind, string> = {
  library: "library",
  demo: "demo",
}

/** Section heading on /projects. */
export const KIND_SECTION_LABEL: Record<ProjectKind, string> = {
  library: "Open source",
  demo: "Demos",
}

/**
 * Section order. Libraries lead regardless of date — a demo built last week must not push
 * itself above a library that's been maintained for a year.
 */
export const KIND_ORDER: ProjectKind[] = ["library", "demo"]
