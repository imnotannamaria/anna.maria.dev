import { describe, expect, it } from "vitest"
import { topicOf } from "./topics"

describe("topicOf", () => {
  it.each([
    ["Who is Anna?", "person"],
    ["Where has she worked?", "career"],
    ["What is her stack?", "stack"],
    ["What has she built?", "projects"],
    ["What does she write about?", "notes"],
    ["How do I reach her?", "contact"],
  ] as const)("routes the suggested question %s", (question, topic) => {
    expect(topicOf(question)).toBe(topic)
  })

  it("sends a question about films she loves to the log, not to the wall of love", () => {
    expect(topicOf("What films does she love?")).toBe("log")
  })

  it("keeps the wall of love for letters and what people say", () => {
    expect(topicOf("Show me the wall of love")).toBe("wall")
    expect(topicOf("What do people say about her?")).toBe("wall")
  })

  it("does not read the word blog as the log", () => {
    expect(topicOf("Does she have a blog?")).toBe("notes")
  })

  it("has no topic for something it does not know", () => {
    expect(topicOf("banana")).toBeNull()
  })
})
