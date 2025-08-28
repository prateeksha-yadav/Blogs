import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Sun, Moon, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  // Load saved preference
  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem('theme')) as 'light' | 'dark' | null
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const t = stored || (prefersDark ? 'dark' : 'light')
    setTheme(t)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])
  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))
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
              <button
                type="button"
                className="icon-toggle"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-pressed={theme === 'dark'}
              >
                {theme === 'light' ? (
                  <Moon aria-hidden="true" size={28} />
                ) : (
                  <Sun aria-hidden="true" size={28} />
                )}
              </button>
            </nav>
          </form>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="container foot-inner">
          <p>© {new Date().getFullYear()} MyBlog. All rights reserved.</p>
          <p className="foot-small">Built with Next.js & TinaCMS</p>
        </div>
      </footer>
    </>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
