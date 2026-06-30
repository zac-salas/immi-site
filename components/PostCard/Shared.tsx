'use client'

import { useState, useEffect } from 'react'

export type Page = 'home' | 'app' | 'about' | 'create'

// ─── useIsMobile ───────────────────────────────────────────────────────────────

export function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setMobile(mq.matches)
    const h = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return mobile
}

// ─── Nav ───────────────────────────────────────────────────────────────────────

export function Nav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const mobile = useIsMobile()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  useEffect(() => { setMenuOpen(false) }, [page])

  const links: { key: Page; label: string }[] = [
    { key: 'home',  label: 'home' },
    { key: 'about', label: 'about' },
    { key: 'create',   label: 'create' },
    { key: 'app',   label: 'app' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', gap: mobile ? 166 : 28,
        padding: mobile ? '8px 16px' : '10px 20px',
        background: 'rgba(252,252,255,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 100,
        border: '1px solid rgba(127,131,232,0.15)',
        boxShadow: scrolled
          ? '0 4px 24px rgba(43,44,73,0.12)'
          : '0 2px 12px rgba(43,44,73,0.07)',
        transition: 'box-shadow .3s',
        whiteSpace: 'nowrap',
      }}>
        {/* Logo */}
        <button onClick={() => setPage('home')} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          width: 56,
          opacity: 0.8,
          paddingBottom: 2,
        }}>
            <img style={{  }} src="/images/immi.svg" alt="" />
        </button>

        {/* Links */}
        {!mobile && links.map(({ key, label }) => (
          <button key={key} onClick={() => setPage(key)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: page === key ? 500 : 400,
            color: '#2b2c49', opacity: page === key ? 1 : 0.6,
            fontFamily: '"DM Sans", sans-serif', padding: 0,
            transition: 'opacity .15s',
          }}>
            {label}
          </button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24}}>
        {/* Download CTA */}
        <a
          href="https://links.immi.community/invite/VbM49C1iFSMfvqzowoxtRRYrrSk2"
          target="_blank" rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '7px 16px', borderRadius: 100,
            background: '#7f83e8', color: '#FCFCFF',
            fontSize: 13, fontWeight: 500,
            fontFamily: '"DM Sans", sans-serif',
            letterSpacing: '-0.01em', textDecoration: 'none',
          }}>
          download
        </a>

        {/* Mobile hamburger */}
        {mobile && (
          <button onClick={() => setMenuOpen(v => !v)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 2, color: '#2b2c49',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        )}
        </div>
      </nav>

      {mobile && menuOpen && (
        <div style={{
          position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
          zIndex: 99, width: 200,
          background: 'rgba(252,252,255,0.98)',
          backdropFilter: 'blur(12px)',
          borderRadius: 16,
          border: '1px solid rgba(127,131,232,0.15)',
          padding: '8px 0',
          boxShadow: '0 8px 32px rgba(43,44,73,0.12)',
        }}>
          {links.map(({ key, label }) => (
            <button key={key} onClick={() => setPage(key)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '11px 20px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 15,
              fontWeight: page === key ? 500 : 400,
              color: '#2b2c49', fontFamily: '"DM Sans", sans-serif',
            }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────

export function Footer({ setPage }: { setPage: (p: Page) => void }) {
  const mobile = useIsMobile()
  return (
    <footer style={{
      background: '#0f0f14',
      padding: mobile ? '32px 24px' : '40px 80px',
      display: 'flex', flexDirection: mobile ? 'column' : 'row',
      alignItems: mobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 20,
      borderTop: '1px solid rgba(197,197,255,0.06)',
    }}>
      <button onClick={() => setPage('home')} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'none', border: 'none', cursor: 'pointer',
        fontWeight: 500, fontSize: 17, letterSpacing: '-0.03em',
        color: '#FCFCFF', fontFamily: '"DM Sans", sans-serif',
      }}>
        <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="9" fill="#2b2c49"/>
          <circle cx="14" cy="12" r="2.8" fill="#7f83e8"/>
          <circle cx="22" cy="12" r="2.8" fill="#7f83e8"/>
          <path d="M11 21 Q14 17 18 21 Q22 25 25 21" stroke="#7f83e8" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        </svg>
        immi
      </button>
      <ul style={{
        display: 'flex', flexDirection: mobile ? 'column' : 'row',
        gap: mobile ? 10 : 24, flexWrap: 'wrap',
        listStyle: 'none', margin: 0, padding: 0,
      }}>
        {[
          { label: 'terms of use',         href: 'https://www.immi.community/legal/terms-of-use' },
          { label: 'community guidelines', href: 'https://www.immi.community/legal/community-guidelines' },
          { label: 'privacy policy',       href: 'https://www.immi.community/legal/privacy-policy' },
          { label: 'contact',              href: 'mailto:admin@immi.community' },
        ].map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              style={{ fontSize: 12, color: 'rgba(252,252,255,0.35)', textDecoration: 'none' }}>
              {label}
            </a>
          </li>
        ))}
      </ul>
      <span style={{ fontSize: 11, color: 'rgba(252,252,255,0.2)', fontFamily: 'monospace' }}>
        © 2026 immi
      </span>
    </footer>
  )
}

// ─── StoreBtn ──────────────────────────────────────────────────────────────────

export function StoreBtn({ store, light = false }: { store: 'ios' | 'android'; light?: boolean }) {
  const href  = store === 'ios'
    ? 'https://links.immi.community/invite/VbM49C1iFSMfvqzowoxtRRYrrSk2'
    : 'https://play.google.com/store/apps/details?id=com.suryamoney.immiapp'
  const label = store === 'ios' ? 'Download on the' : 'Get it on'
  const name  = store === 'ios' ? 'App Store'        : 'Google Play'
  const icon  = store === 'ios'
    ? <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    : <path d="M3.18 23.76c.34.19.74.21 1.1.07l12.16-7.02-2.62-2.62-10.64 9.57zm-1.76-20.1C1.16 3.97 1 4.32 1 4.73v14.54c0 .41.16.76.42 1.07l.06.06 8.15-8.15v-.19L1.42 3.6l-.01.06zm18.12 9.26L17 11.17l-2.82 2.82 2.56 2.56 2.81-1.62c.8-.46.8-1.21-.01-1.61zM4.28.24c-.36-.14-.76-.12-1.1.07L13.77 9.8l-2.62 2.62L3.18.31z"/>
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '8px 16px', borderRadius: 10,
      background: light ? 'rgba(255,255,255,0.15)' : '#0f0f14',
      border: light ? '1px solid rgba(255,255,255,0.2)' : 'none',
      color: '#FCFCFF', textDecoration: 'none',
      fontFamily: '"DM Sans", sans-serif',
      transition: 'all .2s',
      maxWidth: "150px",
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">{icon}</svg>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span style={{ fontSize: 10, opacity: 0.65, fontWeight: 400 }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.02em' }}>{name}</span>
      </span>
    </a>
  )
}