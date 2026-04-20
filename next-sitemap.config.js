/** @type {import('next-sitemap').IConfig} */
const PRODUCTION_SITE = "https://anna.maria.dev"

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
    policies: [{ userAgent: "*", allow: "/" }],
  },
  exclude: ["/api/*"],
}
