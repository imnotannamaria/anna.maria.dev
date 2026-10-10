/**
 * MOCK DATA. None of these people exist and the text is filler, here to show the wall with
 * short, medium and long letters. Replace every entry with a real, invited letter before this
 * page is published: it must never ship as it is.
 */
export type Letter = {
  id: string
  name: string

  company: string
  role?: string

  text: string

  photo?: string
  linkedin?: string

  featured?: boolean
}

export function featuredLetter(letters: Letter[]): Letter | undefined {
  return letters.find((letter) => letter.featured) ?? letters[0]
}

const FILLER = {
  short:
    "Placeholder letter, short. A couple of sentences is all some people write, and the wall has to hold that too without looking empty next to the long ones.",
  medium:
    "Placeholder letter, medium length. This paragraph stands in for the usual opening: how the two people met, on which team, and for how long they worked together.\n\nThe second paragraph is where a real letter gets specific. It names a project, says what was hard about it, and says what the person did that made the difference. None of that is written here, because none of it has happened yet.",
  long: "Placeholder letter, long. This is about the size of a full LinkedIn recommendation, which is the longest thing this wall is expected to hold. The opening paragraph usually sets the scene: the company, the team, the year, and the role each person had.\n\nThe middle is the part people actually read. A real letter would describe one situation in detail: the deadline that moved, the system that fell over, the client who changed their mind, and what was done about it. It would mention how the work was explained to people who were not engineers, and whether the explanation held up a month later.\n\nThen it tends to widen out. What the person is like to sit next to. Whether they ask questions early or late. What they do when they disagree. These are the sentences a hiring manager skims for, so they should survive being cut off after the first few lines.\n\nThe last paragraph is short and says the obvious thing plainly: would work with them again. This placeholder says nothing of the kind, because nobody wrote it.",
}

export const LETTERS: Letter[] = [
  {
    id: "mock-1",
    name: "Mock Person One",
    company: "Example Company",
    role: "engineering manager",
    text: FILLER.long,
    linkedin: "https://www.linkedin.com/",
  },
  { id: "mock-2", name: "Mock Person Two", company: "Sample Studio", text: FILLER.short },
  {
    id: "mock-3",
    name: "Mock Person Three",
    company: "Placeholder Labs",
    role: "product designer",
    featured: true,
    text: FILLER.medium,
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: "mock-4",
    name: "Mock Person Four",
    company: "Example Company",
    role: "tech lead",
    text: FILLER.medium,
  },
  {
    id: "mock-5",
    name: "Mock Person Five",
    company: "Nowhere Inc.",
    role: "client",
    text: FILLER.long,
  },
  {
    id: "mock-6",
    name: "Mock Person Six",
    company: "Sample Studio",
    role: "frontend engineer",
    text: FILLER.short,
    linkedin: "https://www.linkedin.com/",
  },
]
