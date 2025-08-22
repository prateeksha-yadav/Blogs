import Link from 'next/link'

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
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} />
        ) : (
          <span className="ac-fallback">{post.title.charAt(0).toUpperCase()}</span>
        )}
      </div>
    </div>
  )
}
