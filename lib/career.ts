/**
 * The companies I have worked at, for the invite form's company picker.
 *
 * `org` is the id the career on "Anna, the professional" uses; `name` is how the company
 * spells itself, which is what goes on a letter. lib/career.test.ts fails when a job there has
 * no entry here, so a new one shows up in the picker.
 */
export const EMPLOYERS = [
  { org: "cesar", name: "CESAR" },
  { org: "avanade", name: "Avanade" },
] as const
