import { existsSync } from "node:fs"
import { join } from "node:path"
import { defineConfig, defineCollection, s } from "velite"
import rehypePrettyCode from "rehype-pretty-code"
// Relative, not "@/lib/…". Every other import in this file is a bare package or a node:
// builtin — there is no path-alias precedent here, velite bundles its config with esbuild, and
// whether tsconfig `paths` resolve in that pass is version-dependent. A relative path always
// works. It also means `lib/showcase/registry.ts` must stay free of React and of anything with
// a "use client" in its import graph, because this runs in plain Node before `next build`.
import { SHOWCASE } from "./lib/showcase/registry"

const blog = defineCollection({
  name: "Post",
  pattern: "blog/**/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string(),
    date: s.isodate(),
    tags: s.array(s.string()),
    featured: s.boolean().default(false),
    published: s.boolean().default(true),
    slug: s.path(),
    body: s.mdx(),
  }),
})

const projects = defineCollection({
  name: "Project",
  pattern: "projects/**/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string(),
    date: s.isodate(),
    tags: s.array(s.string()),
    github: s.string().url().optional(),
    live: s.string().url().optional(),
    /**
     * A path under `public/`, served as-is: `cover: "/projects/wristkit.png"`. The files live
     * in `public/projects/`, named after the project, and are not processed by Velite.
     *
     * This used to be `s.image()`, which took a co-located file and returned
     * `{ src, width, height, blurDataURL }`. A plain path loses the blur placeholder and the
     * content hash — `next/image` still optimises it, since a `public/` path is local and
     * needs no `remotePatterns` entry, and the card renders with `fill` so it never needed
     * the dimensions.
     *
     * What `s.image()` also gave was proof the file existed, and that is worth keeping, so
     * it is checked here instead. It is not theoretical: `wristkit.mdx` shipped
     * `cover: "./wirstkit.png"` — two letters swapped — and Velite dropped the whole project
     * from the collection over it. wristkit was simply missing from /projects, with nothing
     * on the page to say so. A missing file should fail the build, not delete a project.
     *
     * Optional, and it stays optional. A project without one falls back to the generated
     * cover, so the grid never has a hole in it and adding art later is a one-line frontmatter
     * change rather than a migration. `/blog` has no equivalent field on purpose — see the
     * note in `components/ui/generated-cover.tsx`.
     */
    cover: s
      .string()
      .refine((value) => value.startsWith("/"), {
        message: "cover must be a path under public/, e.g. /projects/name.png",
      })
      .refine((value) => existsSync(join(process.cwd(), "public", value)), {
        message: "cover file not found under public/",
      })
      .optional(),
    featured: s.boolean().default(false),
    published: s.boolean().default(true),
    slug: s.path(),
    body: s.mdx(),
  }),
})

/**
 * One doc per showcased component.
 *
 * Both pointers out of this file are checked at build time, and neither check is theoretical.
 * `entry` has to name a real registry key, or the index renders a card with no demo behind it.
 * `source` has to be a file that exists, or the doc page links to a GitHub 404 — and component
 * files get renamed every other refactor. It is the same refinement `cover` carries above, for
 * the same reason: the `wirstkit.mdx` typo deleted every project from `/projects` and the page
 * said "nothing published yet" rather than failing the build.
 */
const componentDocs = defineCollection({
  name: "ComponentDoc",
  pattern: "components/**/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string(),
    entry: s.string().refine((key) => key in SHOWCASE, "no showcase entry with that key"),
    source: s
      .string()
      .refine((p) => existsSync(join(process.cwd(), p)), "source file not found in the repo"),
    deps: s.array(s.string()).default([]),
    published: s.boolean().default(true),
    slug: s.path(),
    body: s.mdx(),
  }),
})

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:8].[ext]",
    clean: true,
  },
  collections: { blog, projects, componentDocs },
  mdx: {
    outputFormat: "function-body",
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: "github-dark-dimmed",
          keepBackground: false,
        },
      ],
    ],
  },
})
