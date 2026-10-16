import { describe, expect, it } from "vitest"
import { complete, execute, options, suggest, type FileSystem, type Output } from "./shell"

const system: FileSystem = {
  root: {
    "person.txt": "PERSON",
    notes: { "a-post.txt": "A POST" },
    ".secret": { "secret.txt": "shh" },
  },
  links: {
    "person.txt": "tela:person",
    notes: "tela:notes",
    "notes/a-post.txt": "tela:post:a-post",
    admin: "tela:admin",
  },
}

const text = (output: Output[]) =>
  output
    .map((line) =>
      line.type === "items" ? line.items.map((item) => item.label).join(" ") : line.text,
    )
    .join("\n")

describe("execute", () => {
  it("lists a folder, hiding dotfiles unless asked", () => {
    expect(text(execute(system, [], "ls").output)).toContain("person.txt notes/")
    expect(text(execute(system, [], "ls").output)).not.toContain(".secret")
    expect(text(execute(system, [], "ls -a").output)).toContain(".secret/")
  })

  it("changes folder, and refuses one that is not there", () => {
    expect(execute(system, [], "cd notes").cwd).toEqual(["notes"])
    expect(execute(system, ["notes"], "cd ..").cwd).toEqual([])
    const missing = execute(system, [], "cd nowhere")
    expect(missing.cwd).toEqual([])
    expect(text(missing.output)).toContain("no such folder")
  })

  it("prints a file, and tells a folder from a missing file", () => {
    expect(text(execute(system, [], "cat person.txt").output)).toContain("PERSON")
    expect(text(execute(system, [], "cat notes").output)).toContain("is a folder")
    expect(text(execute(system, [], "cat nothing").output)).toContain("no such file")
  })

  it("opens a page with or without the extension, and a note by its slug", () => {
    expect(execute(system, [], "open person").open).toBe("tela:person")
    expect(execute(system, [], "open person.txt").open).toBe("tela:person")
    expect(execute(system, [], "open notes/a-post").open).toBe("tela:post:a-post")
    expect(execute(system, ["notes"], "open a-post").open).toBe("tela:post:a-post")
  })

  it("opens the admin, which is in no listing", () => {
    expect(execute(system, [], "open admin").open).toBe("tela:admin")
    expect(text(execute(system, [], "ls -a").output)).not.toContain("admin")
  })

  it("opens nothing for a path that leads nowhere", () => {
    const result = execute(system, [], "open nowhere")
    expect(result.open).toBeUndefined()
    expect(text(result.output)).toContain("nothing to open")
  })

  it("answers an unknown command, and denies sudo", () => {
    expect(text(execute(system, [], "rm -rf /").output)).toContain("command not found")
    expect(text(execute(system, [], "sudo ls").output)).toContain("permission denied")
  })
})

// a folder with names that share a start, to tell one way from several
const crowded: FileSystem = {
  root: {
    "person.txt": "PERSON",
    "professional.txt": "PROFESSIONAL",
    "projects.txt": "PROJECTS",
    "log.txt": "LOG",
    notes: { "alpha.txt": "A", "alpine.txt": "B" },
    projects: { "wristkit.txt": "W" },
    ".secret": { "secret.txt": "shh" },
  },
  links: {},
}

describe("complete", () => {
  it("completes a command, with the space that lets you keep typing, and a file name", () => {
    expect(complete(system, [], "he")).toBe("help ")
    expect(complete(system, [], "cat per")).toBe("cat person.txt")
  })

  it("goes as far as the options agree, and no further", () => {
    expect(complete(crowded, [], "cat pro")).toBe("cat pro")
    expect(complete(crowded, [], "cat pers")).toBe("cat person.txt")
    expect(complete(crowded, ["notes"], "cat al")).toBe("cat alp")
    expect(complete(crowded, [], "cat notes/alp")).toBe("cat notes/alp")
    expect(complete(crowded, [], "cat notes/alpi")).toBe("cat notes/alpine.txt")
  })

  it("gives a folder its slash and no space, so you can go on into it", () => {
    expect(complete(crowded, [], "cd not")).toBe("cd notes/")
    expect(complete(crowded, [], "cd notes/")).toBe("cd notes/")
  })

  it("completes in the folder you are in, and through a path", () => {
    expect(complete(crowded, ["notes"], "cat alph")).toBe("cat alpha.txt")
    expect(complete(crowded, [], "cat ~/notes/alph")).toBe("cat ~/notes/alpha.txt")
    expect(complete(crowded, ["notes"], "cat ../per")).toBe("cat ../person.txt")
  })

  it("offers a folder to cd and ls, and no file", () => {
    expect(complete(crowded, [], "cd p")).toBe("cd projects/")
    expect(complete(crowded, [], "ls n")).toBe("ls notes/")
  })

  it("opens a page by its name, without the extension", () => {
    expect(complete(crowded, [], "open pers")).toBe("open person")
    expect(complete(crowded, [], "open notes/alph")).toBe("open notes/alpha")
    // the extension, once it is being typed, stays
    expect(complete(crowded, [], "open person.t")).toBe("open person.txt")
  })

  it("keeps hidden things for whoever types the dot", () => {
    expect(complete(crowded, [], "cat s")).toBe("cat s")
    expect(complete(crowded, [], "cat .sec")).toBe("cat .secret/")
    expect(options(crowded, [], "cat ")).not.toContain(".secret/")
  })

  it("does nothing where there is nothing to finish", () => {
    expect(complete(crowded, [], "")).toBe("")
    expect(complete(crowded, [], "zzz")).toBe("zzz")
    expect(complete(crowded, [], "pwd p")).toBe("pwd p")
    expect(complete(crowded, [], "cd notes/ p")).toBe("cd notes/ p")
    expect(complete(crowded, [], "cat nowhere/x")).toBe("cat nowhere/x")
  })

  it("keeps what was typed before the word, spaces included", () => {
    expect(complete(crowded, [], "  he")).toBe("  help ")
    expect(complete(crowded, [], "cat   pers")).toBe("cat   person.txt")
  })
})

describe("options", () => {
  it("lists what is left when Tab cannot finish the word, sorted", () => {
    expect(options(crowded, [], "c")).toEqual(["cat", "cd", "clear"])
    expect(options(crowded, [], "cat p")).toEqual([
      "person.txt",
      "professional.txt",
      "projects.txt",
      "projects/",
    ])
    expect(options(crowded, ["notes"], "cat alp")).toEqual(["alpha.txt", "alpine.txt"])
    // one Tab more would still get somewhere, so it is not time for the list
    expect(options(crowded, ["notes"], "cat al")).toEqual([])
  })

  it("lists nothing when Tab can finish it, or when there is nothing", () => {
    expect(options(crowded, [], "he")).toEqual([])
    expect(options(crowded, [], "cat pers")).toEqual([])
    expect(options(crowded, [], "zzz")).toEqual([])
  })

  it("lists a folder's content for a space after the command", () => {
    expect(options(crowded, [], "cd ")).toEqual(["notes/", "projects/"])
  })
})

describe("suggest", () => {
  it("shows the rest of the first option, and what taking it makes of the entry", () => {
    expect(suggest(crowded, [], "he")).toEqual({ rest: "lp ", accepted: "help " })
    expect(suggest(crowded, [], "c")).toEqual({ rest: "at ", accepted: "cat " })
    expect(suggest(crowded, [], "cat pers")).toEqual({ rest: "on.txt", accepted: "cat person.txt" })
    expect(suggest(crowded, [], "cd no")).toEqual({ rest: "tes/", accepted: "cd notes/" })
  })

  it("shows nothing for an empty word, a finished one, or no match", () => {
    expect(suggest(crowded, [], "")).toBeNull()
    expect(suggest(crowded, [], "cat ")).toBeNull()
    expect(suggest(crowded, [], "help")).toBeNull()
    expect(suggest(crowded, [], "cat person.txt")).toBeNull()
    expect(suggest(crowded, [], "zzz")).toBeNull()
  })
})
