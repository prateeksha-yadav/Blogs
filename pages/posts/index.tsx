import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import type { GetStaticProps } from 'next'
import Link from 'next/link'
import { useTina } from 'tinacms/dist/react'
import { client } from '../../tina/__generated__/client'
import { readAllPosts } from '../../lib/posts'
import { PostCard } from '../../components/PostCard'

export default function PostsIndex(props: any) {
  const { data } = useTina({ query: props.query, variables: props.variables, data: props.data })
  const settings = (props.settings || {}) as any
  const layout = settings.postsLayout || { columns: 1, rows: 0 }

  if (!data?.postConnection?.edges) {
    return <p style={{ padding: '2rem' }}>Loading...</p>
  }

  const posts = data.postConnection.edges
    .map((e: any) => e.node)
    .sort(
      (a: any, b: any) =>
        (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0)
    )

  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const router = useRouter()

  // Initialize search from query param (so header search works)
  useEffect(() => {
    if (!router.isReady) return
    const q = typeof router.query.search === 'string' ? router.query.search : ''
    setSearch(q || '')
  }, [router.isReady, router.query.search])

  // Estimate reading time (200 wpm)
  const withMetrics = useMemo(() => posts.map((p:any)=> {
    const wordCount = JSON.stringify(p.body||'').split(/\s+/).length
    const minutes = Math.max(1, Math.round(wordCount / 200))
    return { ...p, _reading: minutes }
  }), [posts])

  const filtered = useMemo(
    () =>
      withMetrics.filter((p: any) => {
        const blob =
          (p.title || '') +
          ' ' +
          (p.excerpt || '') +
          ' ' +
          JSON.stringify(p.body || '')
        const sOk = !search || blob.toLowerCase().includes(search.toLowerCase())
        const d = p.date ? new Date(p.date) : null
        const fOk = !from || (d && d >= new Date(from))
        const tOk = !to || (d && d <= new Date(to))
        return sOk && fOk && tOk
      }),
    [withMetrics, search, from, to]
  )

  // Build keyword index across posts (title, excerpt, tags, body plain text)
  const keywordIndex = useMemo(() => {
    const stop = new Set(['the','and','for','with','that','this','from','into','your','you','are','was','were','have','has','had','but','not','can','will','its','our','out','about','what','how','why','when','there','their','them','they','of','to','in','on','a','an','it','as','by','is','at','be'])
    const freq: Record<string, number> = {}
    posts.forEach((p:any) => {
      const blob = [p.title, p.excerpt, (p.tags||[]).join(' '), JSON.stringify(p.body||'')].join(' ').toLowerCase()
      blob
        .replace(/[^a-z0-9\s]/g,' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stop.has(w))
        .forEach(w => { freq[w] = (freq[w]||0) + 1 })
    })
    return freq
  }, [posts])

  // Keyword suggestions
  const suggestions = useMemo(() => {
    if (!search || search.trim().length < 2) return []
    const term = search.toLowerCase()
    return Object.entries(keywordIndex)
      .filter(([w]) => w.includes(term))
      .sort((a,b)=> b[1]-a[1])
      .slice(0,8)
      .map(([w])=> w)
  }, [search, keywordIndex])
  const sugRef = useRef<HTMLDivElement|null>(null)
  useEffect(()=>{
    const handler = (e:MouseEvent)=> {
      if (!sugRef.current) return
      if (!sugRef.current.contains(e.target as any)) {
        // click outside closes suggestions only if not typing
        // setSearch(search) // keep search
      }
    }
    document.addEventListener('click', handler)
    return ()=> document.removeEventListener('click', handler)
  },[])

  return (
    <div className="container" style={{ padding: '3rem 0 4rem' }}>
      <header className="listing-head listing-head-centered">
        <div className="lh-center-block">
          <h1 className="page-title">Blog</h1>
        </div>
      </header>

      <div
        className="post-list"
        style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: `repeat(${layout.columns || 1}, minmax(0, 1fr))`,
          }}
      >
        {filtered
          .slice(0, layout.rows && layout.columns ? layout.rows * layout.columns : filtered.length)
          .map((p: any) => (
            <div key={p._sys.filename} style={{ position:'relative' }}>
              <PostCard
                post={{
                  slug: p._sys.filename,
                  title: p.title || p._sys.filename,
                  excerpt: p.excerpt ? p.excerpt + ` · ${p._reading} min read` : `${p._reading} min read`,
                  date: p.date,
                  coverImage: p.coverImage,
                }}
              />
        {p.tags?.filter((t:string)=> (t||'').trim().length>0).length > 0 && (
                <div style={{ position:'absolute', top:8, left:8, display:'flex', gap:6, flexWrap:'wrap' }}>
          {p.tags.filter((t:string)=> (t||'').trim().length>0).slice(0,3).map((t:string)=>(
                    <Link key={t} href={`/posts/tags/${t}`} style={{ background:'rgba(255,255,255,.8)', padding:'2px 6px', borderRadius:6, fontSize:10, fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase', color:'var(--text)' }}>{t}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        {filtered.length === 0 && <p className="dim">No posts match filters.</p>}
      </div>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const postsRes = await client.queries.postConnection({})
    // Fetch the single settings document (site.md)
    let settings: any = null
    try {
      const settingsRes = await client.queries.settings({ relativePath: 'site.md' })
      settings = settingsRes.data.settings
    } catch (e) {
      // settings file might not exist yet
    }
    return {
      props: {
        data: postsRes.data,
        query: postsRes.query,
        variables: postsRes.variables,
        settings,
      },
      revalidate: 60,
    }
  } catch (err) {
    // Fallback: read markdown files directly
    const posts = readAllPosts()
    // Create a minimal data structure similar to Tina's postConnection
    const data = { postConnection: { edges: posts.map(p=>({ node: p })) } }
    return {
      props: {
        data,
        query: null,
        variables: null,
        settings: null,
      },
      revalidate: 60,
    }
  }
}
