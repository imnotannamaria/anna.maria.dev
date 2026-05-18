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
