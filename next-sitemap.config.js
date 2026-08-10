/** @type {import('next-sitemap').IConfig} */
const PRODUCTION_SITE = "https://annamaria.app"

function resolveSiteUrl() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ""
  // Local `.env.local` often points at localhost; committed sitemap/robots should stay canonical.
  if (base && !/localhost|127\.0\.0\.1/i.test(base)) {
    return base
  }
  return PRODUCTION_SITE
}

module.exports = {
  siteUrl: resolveSiteUrl(),
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/*"] }],
  },
  // /admin is already a 404 for anyone not on the allowlist, and its layout sends
  // noindex. This is the third layer, so it never reaches an index by accident.
  exclude: ["/api/*", "/admin", "/admin/*"],

  /**
   * next-sitemap only walks what the build emitted as static or SSG, so every
   * `force-dynamic` page was silently missing — including the home page. They are public,
   * indexable and have metadata; being rendered per request says nothing about whether a
   * crawler should know they exist.
   *
   * Anything that becomes force-dynamic from here needs a line added below.
   */
  additionalPaths: async (config) =>
    Promise.all(["/", "/log", "/roadmap"].map((loc) => config.transform(config, loc))),
}
