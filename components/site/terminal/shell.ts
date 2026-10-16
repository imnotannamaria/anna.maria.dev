import { z } from "zod"
/** The terminal's shell with no UI: a pure function from (cwd, line) to what to print. */
/** A command as typed: one line, trimmed, and short enough to be a command and not a paste. */
export const commandSchema = z
  .string()
  .max(200)
  .transform((raw) => raw.replace(/[\r\n]+/g, " ").trim())

export type Directory = { [name: string]: string | Directory }

/**
 * What the shell says, in English. A translation has the same shape; `{name}` is a slot. The
 * file system carries its words, so the shell stays a plain function with nothing to look up.
 */
export const SHELL_WORDS = {
  does: {
    help: "this list",
    ls: "what is in here (-a shows everything)",
    cd: "go into a folder",
    cat: "read the short version of a page",
    open: "go to the real page",
    routes: "every endpoint, and what stands in front of it",
    whoami: "who built this",
    pwd: "where you are",
    clear: "wipe the screen",
  },
  helpTop: "these run when you click them, too:",
  helpEnd: "not everything is on this list.",
  empty: "(empty)",
  notFolder: "ls: {target}: not a folder",
  noFolder: "cd: {target}: no such folder",
  whichFile: "cat: which file? (the other cat is in the corner)",
  isFolder: "cat: {target}: is a folder",
  noFile: "cat: {target}: no such file",
  whichPage: "open: which page? try `open person`",
  nothing: "open: {target}: nothing to open there",
  opening: "opening {name} …",
  open: "open {name}",
  aNote: "{slug}, the note",
  aProject: "{slug}, the project",
  aPage: "the {page} page",
  meow: "she heard that.",
  snake: "not built yet. it is on the list.",
  sudo: "permission denied. nice try.",
  unknown: "{command}: command not found. try help",
}

export type ShellWords = typeof SHELL_WORDS

export type FileSystem = { root: Directory; links: Record<string, string>; words?: ShellWords }

/** Fills the `{slots}` of a sentence. */
const say = (sentence: string, values: Record<string, string> = {}) =>
  sentence.replace(/\{(\w+)\}/g, (_, name: string) => values[name] ?? "")

export type ItemKind = "command" | "folder" | "file" | "link"

export type Output =
  | { type: "echo"; path: string; text: string }
  | { type: "text"; text: string }
  | { type: "error"; text: string }
  | {
      type: "items"
      items: { label: string; command: string; kind: ItemKind; note?: string }[]
    }

export type Result = {
  cwd: string[]
  output: Output[]
  clear?: boolean

  open?: string

  /** Something Abimaela should hear about. */
  event?: "meow" | "secret" | "snake" | "sudo" | "unknown" | "open"
}

export const COMMANDS = [
  { name: "help" },
  { name: "ls" },
  { name: "cd" },
  { name: "cat" },
  { name: "open" },
  { name: "routes" },
  { name: "whoami" },
  { name: "pwd" },
  { name: "clear" },
] as const

export const path = (cwd: string[]) => `~${cwd.length ? `/${cwd.join("/")}` : ""}`

function go(root: Directory, parts: string[]): string | Directory | undefined {
  let node: string | Directory | undefined = root
  for (const part of parts) {
    if (typeof node !== "object") return undefined
    node = node[part]
  }
  return node
}

function resolver(cwd: string[], target: string): string[] {
  const parts = target.startsWith("/") || target.startsWith("~") ? [] : [...cwd]
  for (const part of target.replace(/^~/, "").split("/")) {
    if (!part || part === ".") continue
    if (part === "..") parts.pop()
    else parts.push(part)
  }
  return parts
}

const destinationName = (href: string, words: ShellWords) => {
  const [type, slug] = href.replace(/^tela:/, "").split(":")
  if (slug) return say(type === "post" ? words.aNote : words.aProject, { slug })
  return say(words.aPage, { page: type.replaceAll("-", " ") })
}

const text = (t: string): Output => ({ type: "text", text: t })
const error = (t: string): Output => ({ type: "error", text: t })

export function execute(system: FileSystem, cwd: string[], line: string): Result {
  const { root, links } = system
  const words = system.words ?? SHELL_WORDS
  const [cmd = "", ...args] = line.trim().split(/\s+/)
  const ok = (...output: Output[]): Result => ({ cwd, output })

  switch (cmd) {
    case "":
      return ok()

    case "clear":
      return { cwd, output: [], clear: true }

    case "help":
      return ok(
        text(words.helpTop),
        {
          type: "items",
          items: COMMANDS.map((c) => ({
            label: c.name,
            command: c.name,
            kind: "command",
            note: words.does[c.name],
          })),
        },
        text(words.helpEnd),
      )

    case "pwd":
      return ok(text(path(cwd)))

    case "whoami":
      return ok(...execute(system, [], "cat person.txt").output)

    case "routes":
      return ok(...execute(system, [], "cat api/routes.txt").output)

    case "ls": {
      const all = args.includes("-a")
      const target = args.find((a) => !a.startsWith("-"))
      const destination = target ? resolver(cwd, target) : cwd
      const node = go(root, destination)
      if (typeof node !== "object") return ok(error(say(words.notFolder, { target: target ?? "" })))
      const names = Object.keys(node).filter((name) => all || !name.startsWith("."))
      if (names.length === 0) return ok(text(words.empty))
      return ok({
        type: "items",
        items: names.map((name) => {
          const folder = typeof node[name] === "object"
          const full = `~/${[...destination, name].join("/")}`
          return {
            label: folder ? `${name}/` : name,
            command: `${folder ? "cd" : "cat"} ${full}`,
            kind: folder ? "folder" : "file",
          }
        }),
      })
    }

    case "cd": {
      const destination = resolver(cwd, args[0] ?? "~")
      if (typeof go(root, destination) !== "object") {
        return ok(error(say(words.noFolder, { target: args[0] })))
      }

      return { cwd: destination, output: execute(system, destination, "ls").output }
    }

    case "cat": {
      if (!args[0]) {
        return {
          cwd,
          output: [error(words.whichFile)],
          event: "meow",
        }
      }
      const parts = resolver(cwd, args[0])
      const node = go(root, parts)
      if (typeof node !== "string") {
        return ok(error(say(node ? words.isFolder : words.noFile, { target: args[0] })))
      }

      const href = links[parts.join("/")]
      const door: Output[] = href
        ? [
            {
              type: "items",
              items: [
                {
                  label: say(words.open, { name: destinationName(href, words) }),
                  command: `open ~/${parts.join("/")}`,
                  kind: "link",
                },
              ],
            },
          ]
        : []
      return {
        cwd,
        output: [text(node), ...door],
        event: parts.includes(".secret") ? "secret" : undefined,
      }
    }

    case "open": {
      if (!args[0]) return ok(error(words.whichPage))
      const key = resolver(cwd, args[0]).join("/")

      const href = links[key] ?? links[`${key}.txt`] ?? (key === "" ? "tela:home" : undefined)
      if (!href) return ok(error(say(words.nothing, { target: args[0] })))
      return {
        cwd,
        output: [text(say(words.opening, { name: destinationName(href, words) }))],
        open: href,
        event: "open",
      }
    }

    case "meow":
    case "abimaela":
    case "pspsps":
      return { cwd, output: [text(words.meow)], event: "meow" }

    case "snake":
      return { cwd, output: [text(words.snake)], event: "snake" }

    case "sudo":
      return { cwd, output: [error(words.sudo)], event: "sudo" }

    default:
      return { cwd, output: [error(say(words.unknown, { command: cmd }))], event: "unknown" }
  }
}

/**
 * What can finish the word being typed. `head` is everything before that word, as typed;
 * `piece` is the word so far; `matches` are the ways to end it, in the order they are offered.
 * A match's `text` replaces the whole word (a path keeps its folders), its `label` is the name
 * alone, which is what a list of options shows.
 */
export type Completion = {
  head: string
  piece: string
  matches: { text: string; label: string; kind: "command" | "folder" | "file" }[]
}

// what each command takes as its argument: a folder, a file or a folder to go through, or a page
const TAKES = { cd: "folder", ls: "folder", cat: "any", open: "page" } as const

export function completion(system: FileSystem, cwd: string[], entry: string): Completion {
  const lead = entry.length - entry.trimStart().length
  const body = entry.slice(lead)
  const parts = body.split(/\s+/)
  const piece = parts.at(-1) ?? ""
  const head = entry.slice(0, entry.length - piece.length)
  const none: Completion = { head, piece, matches: [] }
  if (!body) return none

  if (parts.length === 1) {
    const matches = COMMANDS.filter((command) => command.name.startsWith(piece))
      .map((command) => ({ text: command.name, label: command.name, kind: "command" as const }))
      .sort((a, b) => a.label.localeCompare(b.label))
    return { head, piece, matches }
  }

  const takes = TAKES[parts[0] as keyof typeof TAKES]
  // `cd` and `open` take one thing; `ls` and `cat` take as many as you like
  const one = parts[0] === "cd" || parts[0] === "open"
  if (!takes || (one && parts.length > 2)) return none

  const cut = piece.lastIndexOf("/")
  const base = cut >= 0 ? piece.slice(0, cut + 1) : ""
  const name = piece.slice(cut + 1)
  const folder = go(system.root, resolver(cwd, base))
  if (typeof folder !== "object") return none

  const matches = Object.keys(folder)
    // a hidden thing is offered only to someone who typed the dot
    .filter((entryName) => entryName.startsWith(name) && (!entryName.startsWith(".") || name))
    .flatMap((entryName) => {
      const isFolder = typeof folder[entryName] === "object"
      if (takes === "folder" && !isFolder) return []
      // A page is opened by its name, with or without the extension: the shorter one is offered,
      // unless the extension is already being typed.
      const short = entryName.replace(/\.txt$/, "")
      const shown = takes === "page" && !isFolder && short.startsWith(name) ? short : entryName
      const label = isFolder ? `${shown}/` : shown
      return [
        {
          text: `${base}${label}`,
          label,
          kind: isFolder ? ("folder" as const) : ("file" as const),
        },
      ]
    })
    .sort((a, b) => a.label.localeCompare(b.label))
  return { head, piece, matches }
}

const commonStart = (words: string[]) =>
  words.reduce((start, word) => {
    let end = 0
    while (end < start.length && end < word.length && start[end] === word[end]) end++
    return start.slice(0, end)
  })

/**
 * What Tab does: finish the word when there is one way to, go as far as the options agree when
 * there are several, and change nothing when there is no way. A command gets the space that
 * lets you keep typing; a folder gets its slash, and no space, so you can go on into it.
 */
export function complete(system: FileSystem, cwd: string[], entry: string): string {
  const { head, piece, matches } = completion(system, cwd, entry)
  if (matches.length === 0) return entry
  if (matches.length === 1) {
    const [only] = matches
    return `${head}${only.text}${only.kind === "command" ? " " : ""}`
  }
  const shared = commonStart(matches.map((match) => match.text))
  return shared.length > piece.length ? `${head}${shared}` : entry
}

/** The names a second look at Tab shows, when it cannot finish the word. Empty if it can. */
export function options(system: FileSystem, cwd: string[], entry: string): string[] {
  const { matches } = completion(system, cwd, entry)
  return matches.length > 1 && complete(system, cwd, entry) === entry
    ? matches.map((match) => match.label)
    : []
}

/**
 * The grey rest of the word, drawn after the cursor, and what accepting it makes of the entry.
 * It is the first option, so with several the other ways in are Tab and its list. Nothing for an
 * empty word: a suggestion appears once you have typed something.
 */
export function suggest(
  system: FileSystem,
  cwd: string[],
  entry: string,
): { rest: string; accepted: string } | null {
  const { head, piece, matches } = completion(system, cwd, entry)
  const [first] = matches
  if (!first || !piece) return null
  const accepted = `${head}${first.text}${first.kind === "command" ? " " : ""}`
  const rest = accepted.slice(entry.length)
  return rest.trim() ? { rest, accepted } : null
}
