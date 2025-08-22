import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

function Layout({ children }: { children: React.ReactNode }) {
  const r = useRouter()
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
          <nav className="main-nav">
            <button
              type="button"
              className="icon-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? (
                <Moon aria-hidden="true" size={28} />
              ) : (
                <Sun aria-hidden="true" size={28} />
              )}
            </button>
          </nav>
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
