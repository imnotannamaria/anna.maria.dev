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
     * A real image, co-located with the .mdx and referenced relatively:
     * `cover: "./wristkit.png"`. Velite copies it into `public/static` with a content hash
     * and hands back `{ src, width, height, blurDataURL }`, so `next/image` gets real
     * dimensions and a blur placeholder without a single entry in `remotePatterns`.
     *
     * Optional, and it stays optional. A project without one falls back to the generated
     * cover, so the grid never has a hole in it and adding art later is a one-line frontmatter
     * change rather than a migration. `/blog` has no equivalent field on purpose — see the
     * note in `components/ui/generated-cover.tsx`.
     */
    cover: s.image().optional(),
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
