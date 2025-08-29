import Link from 'next/link'
import type React from 'react'
import { normalizeCover } from '../lib/images'

export interface PostMeta {
  slug: string
  title: string
  excerpt?: string | null
  date?: string | null // kept for compatibility, not displayed
  coverImage?: string | null
  tags?: string[]
}

export const PostCard = ({ post }: { post: PostMeta }) => {
  const raw = post.excerpt || ''
  const words = raw.trim().split(/\s+/).filter(Boolean)
  const preview = words.slice(0, 100).join(' ')

  // Map a tag string to a deterministic H and S for CSS custom properties.
  // We keep L values in CSS (light/dark) so themes handle contrast.
  const tagToVars = (tag: string) => {
    // simple hash
    let h = 0
    for (let i = 0; i < tag.length; i++) {
      h = (h << 5) - h + tag.charCodeAt(i)
      h |= 0
    }
    const hue = Math.abs(h) % 360
    // pick saturation between 48% and 78%
    const sat = 48 + (Math.abs(h) % 31)
    // set both the `--tag-` variables and the fallback `--h/--s` so CSS always picks them
    return {
      '--tag-h': String(hue),
      '--tag-s': `${sat}%`,
      '--h': String(hue),
      '--s': `${sat}%`,
    } as React.CSSProperties
  }
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
    {/* tags moved out of the flow; will be rendered after ac-text so absolute positioning
      targets the parent .article-card reliably */}
    </div>
      <div className="ac-thumb">
        {normalizeCover(post.coverImage) ? (
          <img src={normalizeCover(post.coverImage)} alt={post.title} />
        ) : (
          <span className="ac-fallback">{post.title.charAt(0).toUpperCase()}</span>
        )}
      </div>
      {post.tags && post.tags.length > 0 && (
        <div className="ac-tags" aria-hidden={false}>
          {post.tags.map((t) => (
            <span key={t} className="ac-tag" style={tagToVars(t)}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
