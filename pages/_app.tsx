import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ThemeProvider } from 'next-themes'

const ThemeToggle = dynamic(() => import('../components/ThemeToggle'), { ssr: false })

function Layout({ children }: { children: React.ReactNode }) {
  // theme is now managed by `next-themes` ThemeProvider and the ThemeToggle component
  const router = useRouter()

  const [q, setQ] = useState('')
  const doSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const encoded = encodeURIComponent(q || '')
    // navigate normally so it appears in history when user submits
    router.push(`/posts${q ? `?search=${encoded}` : ''}`)
  }

  const onInputChange = (val: string) => {
    setQ(val)
    // If we're already on the posts page, update the query shallowly so the posts list updates immediately
    if (router.pathname === '/posts') {
      const t = val.trim()
      if (t) {
        const encoded = encodeURIComponent(t)
        router.replace(`/posts?search=${encoded}`, undefined, { shallow: true })
      } else {
        router.replace('/posts', undefined, { shallow: true })
      }
    }
  }

  // Keep header input in sync with URL query when on /posts so clearing shows all posts
  useEffect(() => {
    if (router.pathname !== '/posts') return
    const qs = router.query.search
    const v = typeof qs === 'string' ? qs : ''
    setQ(v || '')
  }, [router.pathname, router.query.search])

  return (
    <>
      <header className="site-header">
        <div className="container head-inner">
          <Link href="/posts" className="brand-group" aria-label="Home">
            <img
              src="https://www.quanttradertools.com/logo.svg"
              alt="Quant Trader Tools Logo"
              className="brand-logo"
              loading="lazy"
            />
              <span className="brand-name">QUANT TRADER TOOLS</span>
          </Link>
          <form onSubmit={doSearch} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              aria-label="Search posts"
              placeholder="Search posts..."
              value={q}
              onChange={(e) => onInputChange(e.target.value)}
              style={{ padding: '0.45rem 0.65rem', borderRadius: 8, border: '1px solid var(--border)', width: '16rem' }}
            />
            <button type="submit" aria-label="Search" style={{ padding: '.45rem .6rem', borderRadius: 8, background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={16} />
            </button>
            <nav className="main-nav">
              <ThemeToggle />
            </nav>
          </form>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="container foot-inner">
          <p>© {new Date().getFullYear()} QuantTraderTools Blog. All rights reserved.</p>
          <p className="foot-small"></p>
        </div>
      </footer>
    </>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light">
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  )
}
