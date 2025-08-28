import { client } from '../../../tina/__generated__/client'
import { readAllPosts } from '../../../lib/posts'
import Link from 'next/link'
import { PostCard } from '../../../components/PostCard'

export default function TagPage(props: any) {
  const { posts, tag } = props
  return (
    <div className="container" style={{ padding:'3rem 0 4rem' }}>
      <p style={{ margin:'0 0 1rem', fontSize:'.75rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--text-dim)' }}>
        <Link href="/posts" style={{ color:'var(--primary)' }}>Posts</Link> / Tag
      </p>
      <h1 style={{ margin:'0 0 2rem', fontSize:'2.25rem', fontWeight:700 }}>#{tag}</h1>
      <div className="grid sm-grid-2 pro-grid">
        {posts.map((p:any)=>(
          <PostCard key={p._sys.filename} post={{ slug:p._sys.filename, title:p.title || p._sys.filename, excerpt:p.excerpt, date:p.date, coverImage:p.coverImage }} />
        ))}
        {posts.length===0 && <p>No posts for this tag yet.</p>}
      </div>
    </div>
  )
}

export const getStaticPaths = async () => {
  try {
    const { data } = await client.queries.postConnection()
    const edges = data.postConnection?.edges || []
    const tags = new Set<string>()
    edges.forEach(e => {
      const node: any = e?.node
      if (!node) return
      ;(node.tags || []).forEach((t: string | null) => {
        if (t) tags.add(t)
      })
    })
    return { paths: Array.from(tags).map(t=>({ params:{ tag:t } })), fallback:'blocking' }
  } catch (err) {
    // Fallback: scan filesystem
    const posts = readAllPosts()
    const tags = new Set<string>()
    posts.forEach((p:any)=> (p.tags||[]).forEach((t:string)=> t && tags.add(t)))
    return { paths: Array.from(tags).map(t=>({ params:{ tag:t } })), fallback:'blocking' }
  }
}

export const getStaticProps = async (ctx:any) => {
  const tag = ctx.params.tag
  try {
    const { data } = await client.queries.postConnection()
    const edges = data.postConnection?.edges || []
    const posts = edges
      .map(e => e?.node)
      .filter((p:any)=> p && (p.tags||[]).includes(tag))
    return { props:{ posts, tag }, revalidate:60 }
  } catch (err) {
    const posts = readAllPosts().filter((p:any)=> (p.tags||[]).includes(tag))
    return { props:{ posts, tag }, revalidate:60 }
  }
}
