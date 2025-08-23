/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
// If deploying under a subpath (e.g. GitHub Pages repo), set this env var
// Example: NEXT_PUBLIC_BASE_PATH=/Blogs
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
// Use ASSET_PREFIX if you host static assets from CDN; otherwise reuse basePath
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || basePath || ''

const nextConfig = {
  reactStrictMode: true,
  // Only apply when provided; keeps local dev simple
  ...(basePath ? { basePath } : {}),
  ...(assetPrefix ? { assetPrefix } : {}),
}

module.exports = nextConfig
