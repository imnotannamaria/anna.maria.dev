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

  event?: "meow" | "secret" | "snake"
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
      }
    }

    case "meow":
    case "abimaela":
    case "pspsps":
      return { cwd, output: [text(words.meow)], event: "meow" }

    case "snake":
      return { cwd, output: [text(words.snake)], event: "snake" }

    case "sudo":
      return ok(error(words.sudo))

    default:
      return ok(error(say(words.unknown, { command: cmd })))
  }
}

export function complete(system: FileSystem, cwd: string[], entry: string): string {
  const parts = entry.split(/\s+/)
  const last = parts.at(-1) ?? ""

  if (parts.length === 1) {
    const found = COMMANDS.filter((c) => c.name.startsWith(last))
    return found.length === 1 ? `${found[0].name} ` : entry
  }

  const cut = last.lastIndexOf("/")
  const base = cut >= 0 ? last.slice(0, cut + 1) : ""
  const piece = last.slice(cut + 1)
  const folder = go(system.root, resolver(cwd, base))
  if (typeof folder !== "object") return entry

  const found = Object.keys(folder).filter((name) => name.startsWith(piece))
  if (found.length !== 1) return entry
  const final = typeof folder[found[0]] === "object" ? "/" : ""
  return [...parts.slice(0, -1), `${base}${found[0]}${final}`].join(" ")
}
