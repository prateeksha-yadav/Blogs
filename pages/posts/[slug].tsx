import { useTina } from 'tinacms/dist/react'
import { client } from '../../tina/__generated__/client'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState, useMemo } from 'react'

// Normalize image paths from content
const normalizeCover = (src?: string | null) => {
  if (!src) return ''
  let s = String(src).trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  if (!s.startsWith('/')) s = '/' + s
  s = s.replace(/\/{2,}/g, '/')
  return s
}

const formatDate = (iso?: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  const y = d.getUTCFullYear()
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = d.toLocaleString('en', { month: 'short' }).toUpperCase()
  return `${day}.${month}.${y}`
}

// Minimal rich text renderer for Tina content
function RichText({ data }: { data: any }) {
  if (!data) return null

  // Helper: get plain text from a node tree
  const nodeText = (node: any): string => {
    if (!node) return ''
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.map(nodeText).join('')
    if (node.text) return node.text
    return node.children ? node.children.map(nodeText).join('') : ''
  }

  // Very small markdown-to-react fallback (headings, lists, paragraphs)
  const renderMarkdownString = (md: string) => {
    const lines = md.replace(/\r\n?/g, '\n').split('\n')
    const out: JSX.Element[] = []
    let i = 0
    const pushPara = (buf: string[]) => {
      const text = buf.join(' ').trim()
      if (text) out.push(<p key={`p-${out.length}`} style={{ lineHeight: 1.6, margin: '0 0 1rem' }}>{text}</p>)
    }
    while (i < lines.length) {
      const line = lines[i]
      // headings
      const m = /^(#{1,6})\s+(.*)$/.exec(line)
      if (m) {
        const level = Math.min(6, m[1].length)
        const Tag: any = `h${level}`
        out.push(<Tag key={`h-${out.length}`} style={{ margin: '2rem 0 1rem', fontWeight: 700 }}>{m[2]}</Tag>)
        i++; continue
      }
      // unordered list
      if (/^\s*[-*]\s+/.test(line)) {
        const items: string[] = []
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
          i++
        }
        out.push(
          <ul key={`ul-${out.length}`} style={{ margin: '0 0 1rem 1.25rem' }}>
            {items.map((it, idx) => <li key={idx}>{it}</li>)}
          </ul>
        )
        continue
      }
      // ordered list
      if (/^\s*\d+\.\s+/.test(line)) {
        const items: string[] = []
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
          i++
        }
        out.push(
          <ol key={`ol-${out.length}`} style={{ margin: '0 0 1rem 1.25rem' }}>
            {items.map((it, idx) => <li key={idx}>{it}</li>)}
          </ol>
        )
        continue
      }
      // code fence (simple): collect until closing fence
      if (/^```/.test(line)) {
        const code: string[] = []
        i++
        while (i < lines.length && !/^```/.test(lines[i])) { code.push(lines[i]); i++ }
        if (i < lines.length) i++ // skip closing fence
        out.push(<pre key={`pre-${out.length}`}><code>{code.join('\n')}</code></pre>)
        continue
      }
      // paragraphs (collect contiguous non-empty lines)
      const buf: string[] = []
      while (i < lines.length && lines[i].trim() !== '') { buf.push(lines[i]); i++ }
      pushPara(buf)
      while (i < lines.length && lines[i].trim() === '') i++
    }
    return out
  }

  // If the user pasted the whole content inside a single fenced code block
  // like ```markdown ... ```, render it as markdown instead of code.
  const children = Array.isArray(data) ? data : data.children || []
  if (
    Array.isArray(children) &&
    children.length === 1 &&
    children[0]?.type === 'code' &&
    /^(md|mdx|markdown)$/i.test(children[0]?.lang || '')
  ) {
    const md = children[0].value || nodeText(children[0])
    return <>{renderMarkdownString(String(md || ''))}</>
  }

  // Normal Tina RichText rendering
  return (children as any[])?.map((block: any, i: number) => {
    const inline = block.children?.map((c: any, j: number) =>
      c.text ? <span key={j}>{c.text}</span> : null
    )
    switch (block.type) {
      case 'p':
        return (
          <p key={i} style={{ lineHeight: 1.6, margin: '0 0 1rem' }}>
            {inline}
          </p>
        )
      default:
        if (/^h[1-6]$/.test(block.type)) {
          const Tag: any = block.type
          return (
            <Tag key={i} style={{ margin: '2rem 0 1rem', fontWeight: 700 }}>
              {inline}
            </Tag>
          )
        }
        if (block.type === 'ul')
          return (
            <ul key={i} style={{ margin: '0 0 1rem 1.25rem' }}>
              {block.children?.map((li: any, k: number) => (
                <li key={k}>
                  {li.children?.map((c: any, j: number) => c.text)}
                </li>
              ))}
            </ul>
          )
        if (block.type === 'ol')
          return (
            <ol key={i} style={{ margin: '0 0 1rem 1.25rem' }}>
              {block.children?.map((li: any, k: number) => (
                <li key={k}>
                  {li.children?.map((c: any, j: number) => c.text)}
                </li>
              ))}
            </ol>
          )
        if (block.type === 'code') {
          const val = block.value || nodeText(block)
          return (
            <pre key={i}>
              <code>{val}</code>
            </pre>
          )
        }
        // Fallback: print any unhandled block as paragraph text
        const txt = nodeText(block)
        return txt ? (
          <p key={i} style={{ lineHeight: 1.6, margin: '0 0 1rem' }}>{txt}</p>
        ) : null
    }
  })
}

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const h = el.scrollHeight - el.clientHeight
      const y = (el.scrollTop / (h || 1)) * 100
      setProgress(Math.min(100, Math.max(0, y)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="progress-bar" style={{ width: progress + '%' }} />
}

export default function PostPage(props: any) {
  const router = useRouter()
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })
  const post = data.post
  // reading metrics
  const metrics = useMemo(()=>{
    const words = JSON.stringify(post.body||'').split(/\s+/).length
    const minutes = Math.max(1, Math.round(words/200))
    return { words, minutes }
  }, [post.body])
  const share = () => {
    try {
      navigator.clipboard.writeText(window.location.href)
    } catch {}
  }
  const goBack = () => {
    try {
      if (window.history.length > 1) router.back()
      else router.push('/posts')
    } catch {
      router.push('/posts')
    }
  }
  return (
    <>
      <ReadingProgress />
      <div className="post-frame pattern-dots">
        <div className="post-shell">
          <button type="button" className="back-btn" onClick={goBack} aria-label="Go back">← Back</button>
          <article className="post-card-view" data-has-img={!!normalizeCover(post.coverImage)}>
          {normalizeCover(post.coverImage) && (
            <div className="pc-media"><img src={normalizeCover(post.coverImage)} alt={post.title} loading="eager" /></div>
          )}
          <h1 className="pc-title">{post.title}</h1>
          <div className="pc-meta">
            {post.date && <span>{formatDate(post.date)}</span>}
            <span>{metrics.minutes} MIN READ</span>
            <span>{metrics.words} WORDS</span>
            <button type="button" onClick={share} className="share-btn thin">COPY LINK</button>
          </div>
          {post.tags?.length > 0 && (
            <div className="pc-tags">
              {post.tags.map((t: string) => (
                <Link key={t} href={`/posts/tags/${t}`} className="tag-chip small">{t}</Link>
              ))}
            </div>
          )}
          <div className="pc-body rich-body"><RichText data={post.body} /></div>
          </article>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths = async () => {
  const { data } = await client.queries.postConnection()
  const edges = data.postConnection?.edges || []
  return {
    paths: edges.map((e: any) => ({
      params: { slug: e.node._sys.filename },
    })),
    fallback: 'blocking',
  }
}

export const getStaticProps = async (ctx: any) => {
  const { data, query, variables } = await client.queries.post({
    relativePath: ctx.params.slug + '.md',
  })
  return { props: { data, query, variables }, revalidate: 60 }
}
