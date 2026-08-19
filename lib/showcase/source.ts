const REPO = "https://github.com/imnotannamaria/anna.maria.dev"

/**
 * A link to a file on GitHub, pinned to `main`.
 *
 * Not a SHA. A SHA is always correct and always old — someone copying a component wants the
 * version that exists now, and when a file moves, `main` breaks the link loudly instead of
 * quietly serving last spring's copy. The path itself is validated at build time by an
 * `existsSync` refinement on the MDX frontmatter, the same way `cover` is in
 * `velite.config.ts`, so a rename fails the build rather than shipping a 404.
 */
export const sourceUrl = (path: string) => `${REPO}/blob/main/${path}`
