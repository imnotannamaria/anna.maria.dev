/** The terminal's shell with no UI: a pure function from (cwd, line) to what to print. */
export type Directory = { [name: string]: string | Directory }

export type FileSystem = { root: Directory; links: Record<string, string> }

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
  { name: "help", does: "this list" },
  { name: "ls", does: "what is in here (-a shows everything)" },
  { name: "cd", does: "go into a folder" },
  { name: "cat", does: "read the short version of a page" },
  { name: "open", does: "go to the real page" },
  { name: "routes", does: "every endpoint, and what stands in front of it" },
  { name: "whoami", does: "who built this" },
  { name: "pwd", does: "where you are" },
  { name: "clear", does: "wipe the screen" },
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

const destinationName = (href: string) => {
  const [type, slug] = href.replace(/^tela:/, "").split(":")
  if (slug) return `${slug}, the ${type === "post" ? "note" : "project"}`
  return `the ${type.replaceAll("-", " ")} page`
}

const text = (t: string): Output => ({ type: "text", text: t })
const error = (t: string): Output => ({ type: "error", text: t })

export function execute(system: FileSystem, cwd: string[], line: string): Result {
  const { root, links } = system
  const [cmd = "", ...args] = line.trim().split(/\s+/)
  const ok = (...output: Output[]): Result => ({ cwd, output })

  switch (cmd) {
    case "":
      return ok()

    case "clear":
      return { cwd, output: [], clear: true }

    case "help":
      return ok(
        text("these run when you click them, too:"),
        {
          type: "items",
          items: COMMANDS.map((c) => ({
            label: c.name,
            command: c.name,
            kind: "command",
            note: c.does,
          })),
        },
        text("not everything is on this list."),
      )

    case "pwd":
      return ok(text(path(cwd)))

    case "whoami":
      return ok(...execute(system, [], "cat about.txt").output)

    case "routes":
      return ok(...execute(system, [], "cat api/routes.txt").output)

    case "ls": {
      const all = args.includes("-a")
      const target = args.find((a) => !a.startsWith("-"))
      const destination = target ? resolver(cwd, target) : cwd
      const node = go(root, destination)
      if (typeof node !== "object") return ok(error(`ls: ${target}: not a folder`))
      const names = Object.keys(node).filter((name) => all || !name.startsWith("."))
      if (names.length === 0) return ok(text("(empty)"))
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
        return ok(error(`cd: ${args[0]}: no such folder`))
      }

      return { cwd: destination, output: execute(system, destination, "ls").output }
    }

    case "cat": {
      if (!args[0]) {
        return {
          cwd,
          output: [error("cat: which file? (the other cat is in the corner)")],
          event: "meow",
        }
      }
      const parts = resolver(cwd, args[0])
      const node = go(root, parts)
      if (typeof node !== "string") {
        return ok(error(`cat: ${args[0]}: ${node ? "is a folder" : "no such file"}`))
      }

      const href = links[parts.join("/")]
      const door: Output[] = href
        ? [
            {
              type: "items",
              items: [
                {
                  label: `open ${destinationName(href)}`,
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
      if (!args[0]) return ok(error("open: which page? try `open person`"))
      const key = resolver(cwd, args[0]).join("/")

      const href = links[key] ?? links[`${key}.txt`] ?? (key === "" ? "tela:home" : undefined)
      if (!href) return ok(error(`open: ${args[0]}: nothing to open there`))
      return { cwd, output: [text(`opening ${destinationName(href)} …`)], open: href }
    }

    case "meow":
    case "abimaela":
    case "pspsps":
      return { cwd, output: [text("she heard that.")], event: "meow" }

    case "snake":
      return { cwd, output: [text("not built yet. it is on the list.")], event: "snake" }

    case "sudo":
      return ok(error("permission denied. nice try."))

    default:
      return ok(error(`${cmd}: command not found. try help`))
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
