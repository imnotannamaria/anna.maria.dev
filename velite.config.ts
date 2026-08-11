import { existsSync } from "node:fs"
import { join } from "node:path"
import { defineConfig, defineCollection, s } from "velite"
import rehypePrettyCode from "rehype-pretty-code"

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

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:8].[ext]",
    clean: true,
  },
  collections: { blog, projects },
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
