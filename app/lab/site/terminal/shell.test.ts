import { describe, expect, it } from "vitest"
import { complete, execute, type FileSystem, type Output } from "./shell"

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

describe("complete", () => {
  it("completes a command, with the space that lets you keep typing, and a file name", () => {
    expect(complete(system, [], "he")).toBe("help ")
    expect(complete(system, [], "cat per")).toBe("cat person.txt")
  })
})
