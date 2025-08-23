import Link from 'next/link'

// Normalize image paths coming from content (trim spaces, ensure leading slash)
const normalizeCover = (src?: string | null) => {
  if (!src) return ''
  let s = String(src).trim()
  if (!s) return ''
  // Allow full URLs as-is
  if (/^https?:\/\//i.test(s)) return s
  if (!s.startsWith('/')) s = '/' + s
  // Collapse duplicate slashes (except protocol part which we don't have here)
  s = s.replace(/\/{2,}/g, '/')
  return s
}

export interface PostMeta {
  slug: string
  title: string
  excerpt?: string | null
  date?: string | null // kept for compatibility, not displayed
  coverImage?: string | null
}

export const PostCard = ({ post }: { post: PostMeta }) => {
  const raw = post.excerpt || ''
  const words = raw.trim().split(/\s+/).filter(Boolean)
  const preview = words.slice(0, 100).join(' ')
  return (
    <div className="article-card" data-variant="image-right">
      <div className="ac-text">
        <h2 className="ac-title">
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h2>
        {preview && (
          <p className="ac-excerpt">
            {preview}
            {words.length > 100 && '...'}
          </p>
        )}
        <div>
          <Link className="ac-readmore" href={`/posts/${post.slug}`}>Read more →</Link>
        </div>
      </div>
      <div className="ac-thumb">
        {normalizeCover(post.coverImage) ? (
          <img src={normalizeCover(post.coverImage)} alt={post.title} />
        ) : (
          <span className="ac-fallback">{post.title.charAt(0).toUpperCase()}</span>
        )}
      </div>
    </div>
  )
}
