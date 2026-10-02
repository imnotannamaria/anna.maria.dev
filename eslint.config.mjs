import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".velite/**"]),
  {
    // entrepta's files are copied in as they are and linted upstream, with Biome. An empty
    // props interface that only extends another is how its components leave room for a prop
    // later, and editing the copy here would be undone by the next update.
    files: ["app/components/entrepta/**"],
    rules: { "@typescript-eslint/no-empty-object-type": "off" },
  },
])

export default eslintConfig
