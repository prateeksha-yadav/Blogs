// Utilities for working with images served from Next.js /public
// Ensures absolute paths like "/blog/image-name.png" (or "/image.png")
// and tries to correct common issues that cause 404s in production:
//  - stray "public/" prefixes
//  - backslashes from Windows paths
//  - duplicate slashes
//  - filename casing mismatches (Windows is case-insensitive; Linux is not)

// Known images committed to /public. Keep this list small and focused on
// images referenced by content; update when new covers are added.
// This helps us repair case-only mismatches after deployment.
const PUBLIC_IMAGE_MANIFEST = [
  "/0012_temp-mail.org_-1-.jpg",
  "/1-2.png",
  "/11.png",
  "/example-cover.jpg",
  "/tm-head.png",
]

const manifestMap = new Map(
  PUBLIC_IMAGE_MANIFEST.map((p) => [p.toLowerCase(), p])
)

export function normalizePublicImagePath(src?: string | null): string {
  if (!src) return ""
  let s = String(src)
    .trim()
    .replace(/\\/g, "/") // Windows backslashes -> forward slashes

  if (!s) return ""

  // Allow remote URLs as-is
  if (/^https?:\/\//i.test(s)) return s

  // Remove any query/hash for matching against manifest
  const hash = s.split("#")[1]
  const query = s.split("?")[1]
  s = s.split("#")[0].split("?")[0]

  // Strip leading ./, ../ and any accidental public/ prefix
  s = s.replace(/^(\.\/)+/g, "")
  s = s.replace(/^(\.\.\/)+/g, "")
  s = s.replace(/^public\//i, "")

  // Ensure it is absolute from the site root
  if (!s.startsWith("/")) s = "/" + s

  // Collapse duplicate slashes
  s = s.replace(/\/{2,}/g, "/")

  // Try to correct filename casing using the manifest
  const fixed = manifestMap.get(s.toLowerCase())
  if (fixed) s = fixed

  // Re-append query/hash if present
  if (query) s += "?" + query
  if (hash) s += "#" + hash

  return s
}

// Convenience alias for future extension if we decide to keep blog images
// under a subfolder like /blog/*. For now, we normalize to site-root paths.
export const normalizeCover = normalizePublicImagePath
