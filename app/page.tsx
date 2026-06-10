'use client'

import { useState, useEffect } from 'react'
import Deck from '@/components/PostCard/Deck/Deck'
import PostCard from '@/components/PostCard/PostCard/PostCard'
import PostCardBack from '@/components/PostCard/PostCard/PostCardBack'
import data from '@/components/PostCard/Types/PostCardData.json'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Page = 'home' | 'app' | 'about'

// ─── useIsMobile ───────────────────────────────────────────────────────────────

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return mobile
}

// ─── Nav ───────────────────────────────────────────────────────────────────────

function Nav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const mobile = useIsMobile()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close menu on page change
  useEffect(() => { setMenuOpen(false) }, [page])

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: mobile ? '0 20px' : '0 48px',
        background: 'rgba(252,252,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(127,131,232,0.12)',
        boxShadow: scrolled ? '0 2px 24px rgba(43,44,73,0.08)' : 'none',
        transition: 'box-shadow .3s',
      }}>
        {/* Logo */}
        <button onClick={() => setPage('home')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#0f0f14"/>
            <circle cx="14" cy="11" r="3" fill="#7f83e8"/>
            <circle cx="22" cy="11" r="3" fill="#7f83e8"/>
            <path d="M11 20 Q14 16 18 20 Q22 24 25 20" stroke="#7f83e8" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
          <span style={{ fontWeight: 500, fontSize: 20, letterSpacing: '-0.03em', color: '#2b2c49' }}>immi</span>
        </button>

        {/* Desktop nav links */}
        {!mobile && (
          <ul style={{ display: 'flex', alignItems: 'center', gap: 32, listStyle: 'none', margin: 0, padding: 0 }}>
            {(['home', 'app', 'about'] as Page[]).map(p => (
              <li key={p}>
                <button onClick={() => setPage(p)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: page === p ? 500 : 400,
                  color: '#2b2c49', opacity: page === p ? 1 : 0.65,
                  fontFamily: 'inherit', padding: 0, transition: 'opacity .2s',
                }}>
                  {p === 'app' ? 'the app' : p === 'about' ? 'about us' : 'home'}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Desktop CTA / Mobile hamburger */}
        {mobile ? (
          <button onClick={() => setMenuOpen(v => !v)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, color: '#2b2c49',
          }}>
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        ) : (
          <a href="https://links.immi.community/invite/VbM49C1iFSMfvqzowoxtRRYrrSk2"
            target="_blank" rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '9px 18px', borderRadius: 100,
              background: '#7f83e8', color: '#FCFCFF',
              fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
              letterSpacing: '-0.01em', textDecoration: 'none', transition: 'all .2s',
            }}>
            download
          </a>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {mobile && menuOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99,
          background: 'rgba(252,252,255,0.98)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(127,131,232,0.12)',
          padding: '12px 0 16px',
          boxShadow: '0 8px 24px rgba(43,44,73,0.08)',
        }}>
          {(['home', 'app', 'about'] as Page[]).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '12px 24px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 16, fontWeight: page === p ? 500 : 400,
              color: '#2b2c49', opacity: page === p ? 1 : 0.7,
              fontFamily: 'inherit',
            }}>
              {p === 'app' ? 'the app' : p === 'about' ? 'about us' : 'home'}
            </button>
          ))}
          <div style={{ padding: '12px 24px 0' }}>
            <a href="https://links.immi.community/invite/VbM49C1iFSMfvqzowoxtRRYrrSk2"
              target="_blank" rel="noreferrer"
              style={{
                display: 'inline-flex', padding: '11px 22px',
                borderRadius: 100, background: '#7f83e8', color: '#FCFCFF',
                fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
                textDecoration: 'none',
              }}>
              download
            </a>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer({ setPage }: { setPage: (p: Page) => void }) {
  const mobile = useIsMobile()
  return (
    <footer style={{
      background: '#0f0f14',
      padding: mobile ? '32px 24px' : '40px 80px',
      display: 'flex',
      flexDirection: mobile ? 'column' : 'row',
      alignItems: mobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 20,
      borderTop: '1px solid rgba(197,197,255,0.06)',
    }}>
      <button onClick={() => setPage('home')} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'none', border: 'none', cursor: 'pointer',
        fontWeight: 500, fontSize: 18, letterSpacing: '-0.03em',
        color: '#FCFCFF', fontFamily: 'inherit',
      }}>
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#2b2c49"/>
          <circle cx="14" cy="11" r="3" fill="#7f83e8"/>
          <circle cx="22" cy="11" r="3" fill="#7f83e8"/>
          <path d="M11 20 Q14 16 18 20 Q22 24 25 20" stroke="#7f83e8" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
        immi
      </button>
      <ul style={{
        display: 'flex', flexDirection: mobile ? 'column' : 'row',
        gap: mobile ? 12 : 24, flexWrap: 'wrap',
        listStyle: 'none', margin: 0, padding: 0,
      }}>
        {[
          { label: 'terms of use',         href: 'https://www.immi.community/legal/terms-of-use' },
          { label: 'community guidelines', href: 'https://www.immi.community/legal/community-guidelines' },
          { label: 'privacy policy',       href: 'https://www.immi.community/legal/privacy-policy' },
          { label: 'contact',              href: 'mailto:admin@immi.community' },
        ].map(({ label, href }) => (
          <li key={label}>
            <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
              style={{ fontSize: 13, color: 'rgba(252,252,255,0.4)', textDecoration: 'none' }}>
              {label}
            </a>
          </li>
        ))}
      </ul>
      <span style={{ fontSize: 12, color: 'rgba(252,252,255,0.25)', fontFamily: 'monospace' }}>© 2026 immi</span>
    </footer>
  )
}

// ─── Store button ──────────────────────────────────────────────────────────────

function StoreBtn({ store }: { store: 'ios' | 'android' }) {
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
      padding: '11px 20px', borderRadius: 12,
      background: '#0f0f14', color: '#FCFCFF',
      textDecoration: 'none', fontFamily: 'inherit',
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">{icon}</svg>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span style={{ fontSize: 10, opacity: 0.65, fontWeight: 400 }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.02em' }}>{name}</span>
      </span>
    </a>
  )
}

// ─── Page: Home ────────────────────────────────────────────────────────────────

function PageHome({ setPage }: { setPage: (p: Page) => void }) {
  const mobile = useIsMobile()
  const pad    = mobile ? '48px 24px' : '80px 80px'

  return (
    <div style={{ paddingTop: 60 }}>

      {/* Hero */}
      <section style={{
        minHeight:           mobile ? 'auto' : 'calc(100vh - 60px)',
        display:             'grid',
        gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
        alignItems:          'center',
        gap:                 48,
        padding:             pad,
        position:            'relative',
        overflow:            'hidden',
      }}>
        <div style={{ position:'absolute', top:-120, right:-120, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(197,197,255,0.35) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-80, left:'10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(127,131,232,0.12) 0%, transparent 70%)', pointerEvents:'none' }}/>

        <div>
          <p style={{ fontFamily:'monospace', fontSize:11, letterSpacing:'-0.04em', color:'#7f83e8', textTransform:'uppercase', marginBottom:20 }}>
            social, but different
          </p>
          <h1 style={{ fontWeight:500, fontSize: mobile ? '42px' : 'clamp(42px,5vw,68px)', lineHeight:1.08, letterSpacing:'-0.03em', color:'#0f0f14', marginBottom:24 }}>
            connection<br/>over <em style={{ fontStyle:'normal', color:'#7f83e8' }}>consumption.</em>
          </h1>
          <p style={{ fontWeight:300, fontSize: mobile ? 16 : 18, lineHeight:1.6, color:'#2b2c49', opacity:0.8, maxWidth:440, marginBottom:40 }}>
            immi is a social platform built around the quality of your relationships — not the quantity of time you spend scrolling.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <StoreBtn store="ios"/>
            <StoreBtn store="android"/>
          </div>
        </div>

        {/* Phone mockup — desktop only */}
        {!mobile && (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', position:'relative' }}>
            <div style={{
              width:260, height:520, background:'#0f0f14', borderRadius:40,
              border:'2px solid rgba(197,197,255,0.2)', position:'relative',
              boxShadow:'0 40px 80px rgba(15,15,20,0.3)',
              overflow:'hidden', animation:'floatY 5s ease-in-out infinite',
            }}>
              <div style={{ position:'absolute', top:14, left:'50%', transform:'translateX(-50%)', width:80, height:6, background:'rgba(255,255,255,0.08)', borderRadius:100 }}/>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', padding:'40px 16px 20px' }}>
                <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', gap:10 }}>
                  <div style={{ width:56, height:56, background:'rgba(127,131,232,0.2)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7f83e8" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>
                  </div>
                  <strong style={{ display:'block', fontSize:13, color:'rgba(252,252,255,0.55)', fontWeight:500 }}>app preview</strong>
                  <p style={{ fontSize:11, color:'rgba(252,252,255,0.3)', lineHeight:1.5 }}>interactive sandbox<br/>coming soon</p>
                </div>
              </div>
            </div>
            <div style={{ position:'absolute', bottom:60, left:-48, background:'#FCFCFF', borderRadius:14, padding:'12px 16px', boxShadow:'0 8px 32px rgba(43,44,73,0.16)', fontSize:12, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:8, animation:'floatY 5.5s ease-in-out infinite .8s' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#9fe883' }}/>
              <div><strong style={{ display:'block', fontWeight:500, fontSize:13 }}>Alex shared an update</strong>just with you</div>
            </div>
            <div style={{ position:'absolute', top:120, right:-52, background:'#FCFCFF', borderRadius:14, padding:'12px 16px', boxShadow:'0 8px 32px rgba(43,44,73,0.16)', fontSize:12, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:8, animation:'floatY 4.8s ease-in-out infinite .3s' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#5ce8b5' }}/>
              <div><strong style={{ display:'block', fontWeight:500, fontSize:13 }}>no algorithm</strong>just your people</div>
            </div>
          </div>
        )}
      </section>

      {/* Vision */}
      <section style={{ background:'#0f0f14', padding: mobile ? '60px 24px' : '100px 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: mobile ? 40 : 80, alignItems:'center' }}>
          <div>
            <p style={{ fontFamily:'monospace', fontSize:11, letterSpacing:'-0.04em', color:'#c5c5ff', textTransform:'uppercase', marginBottom:20 }}>our vision</p>
            <h2 style={{ fontWeight:500, fontSize:'clamp(28px,3.5vw,48px)', lineHeight:1.1, letterSpacing:'-0.03em', color:'#FCFCFF', marginBottom:24 }}>
              technology should be a bridge,<br/>not a destination.
            </h2>
            <p style={{ fontWeight:300, fontSize:16, lineHeight:1.7, color:'rgba(252,252,255,0.65)', marginBottom:16 }}>
              At immi, we measure success in the depth of the conversations that happen after you put your phone down — not in minutes spent scrolling.
            </p>
            <p style={{ fontWeight:300, fontSize:16, lineHeight:1.7, color:'rgba(252,252,255,0.65)', margin:0 }}>
              We're a small, self-funded team building something we genuinely believe in: a social platform that gets out of your way.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            {[
              { title:'Quality over quantity', body:"Every design choice is made to facilitate genuine connection, not passive consumption." },
              { title:'No growth hacks',       body:"We don't use FOMO or dark patterns to keep you scrolling. We want you to spend less time on the app." },
              { title:'Radical simplicity',    body:"A clean, intuitive interface so nothing stands between you and the people who matter." },
            ].map(({ title, body }) => (
              <div key={title} style={{ borderLeft:'2px solid rgba(127,131,232,0.4)', paddingLeft:20 }}>
                <h3 style={{ fontWeight:500, fontSize:16, letterSpacing:'-0.02em', color:'#FCFCFF', marginBottom:6 }}>{title}</h3>
                <p style={{ fontWeight:300, fontSize:14, lineHeight:1.6, color:'rgba(252,252,255,0.5)', margin:0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'linear-gradient(160deg, #c5c5ff 0%, #7f83e8 100%)', padding: mobile ? '60px 24px' : '100px 80px' }}>
        <div style={{ maxWidth:640 }}>
          <h2 style={{ fontWeight:500, fontSize:'clamp(28px,4vw,52px)', lineHeight:1.1, letterSpacing:'-0.03em', color:'#0f0f14', marginBottom:16 }}>ready to be present?</h2>
          <p style={{ fontSize:16, fontWeight:300, lineHeight:1.6, color:'rgba(15,15,20,0.65)', marginBottom:36 }}>
            immi is available now on iOS and Android. Download it and start connecting with intention.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <StoreBtn store="ios"/>
            <StoreBtn store="android"/>
          </div>
        </div>
      </section>

      <Footer setPage={setPage}/>
    </div>
  )
}

// ─── Page: The App ─────────────────────────────────────────────────────────────

function PageApp({ setPage }: { setPage: (p: Page) => void }) {
  const mobile = useIsMobile()

  const features = [
    { title:'your circle',        body:"Follow the people you actually care about. immi isn't designed for followers — it's designed for friends.",
      icon:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
    { title:'postcards',          body:"Send beautifully designed postcards to the people in your circle — personal, private, and meaningful.",
      icon:<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></> },
    { title:'curated connections',body:"Build a curated circle of the people you actually want to stay in touch with. Quality over quantity, always.",
      icon:<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
    { title:'share updates',      body:"Post moments, thoughts, or life updates — and send them to only the people you want to see them.",
      icon:<><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></> },
    { title:'private by design',  body:"Your data is yours. We don't sell it, we don't use it to target you, and we never will.",
      icon:<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> },
  ]

  return (
    <div style={{ paddingTop: 60 }}>

      {/* Hero */}
      <div style={{ padding: mobile ? '48px 24px 32px' : '80px 80px 40px', maxWidth:1100, margin:'0 auto' }}>
        <p style={{ fontFamily:'monospace', fontSize:11, letterSpacing:'-0.04em', color:'#7f83e8', textTransform:'uppercase', marginBottom:16 }}>the app</p>
        <h1 style={{ fontWeight:500, fontSize: mobile ? '36px' : 'clamp(36px,4vw,56px)', letterSpacing:'-0.03em', lineHeight:1.1, color:'#0f0f14', marginBottom:16, maxWidth:600 }}>
          built to bring you closer,<br/>not keep you scrolling.
        </h1>
        <p style={{ fontWeight:300, fontSize: mobile ? 16 : 17, lineHeight:1.65, color:'#2b2c49', opacity:0.75, maxWidth:520, margin:0 }}>
          immi gives you the tools to share, connect, and stay close with the people who matter — without the noise.
        </p>
      </div>

      {/* Features */}
      <section style={{ padding: mobile ? '32px 24px 60px' : '60px 80px 100px' }}>
        <div style={{
          maxWidth:1100, margin:'0 auto',
          display:'grid',
          gridTemplateColumns: mobile ? '1fr' : 'repeat(3,1fr)',
          gap:16,
        }}>
          {features.map(({ icon, title, body }) => (
            <div key={title} style={{
              background:'#FCFCFF', border:'1.5px solid rgba(43,44,73,0.08)',
              borderRadius:20, padding: mobile ? 24 : 32,
            }}>
              <div style={{ width:44, height:44, background:'rgba(197,197,255,0.25)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, color:'#7f83e8' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
              </div>
              <h3 style={{ fontWeight:500, fontSize:17, letterSpacing:'-0.02em', color:'#0f0f14', marginBottom:10 }}>{title}</h3>
              <p style={{ fontWeight:400, fontSize:14, lineHeight:1.65, color:'#2b2c49', opacity:0.7, margin:0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sandbox */}
      <section style={{ padding: mobile ? '48px 16px' : '80px', background:'rgba(197,197,255,0.08)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ marginBottom: mobile ? 32 : 48, padding: mobile ? '0 8px' : 0 }}>
            <p style={{ fontFamily:'monospace', fontSize:11, letterSpacing:'-0.04em', color:'#7f83e8', textTransform:'uppercase', marginBottom:12 }}>try it yourself</p>
            <h2 style={{ fontWeight:500, fontSize:'clamp(24px,3vw,40px)', letterSpacing:'-0.03em', color:'#0f0f14', marginBottom:12 }}>try immi right here</h2>
            <p style={{ fontWeight:300, fontSize:15, lineHeight:1.6, color:'#2b2c49', opacity:0.7, margin:0 }}>
              Swipe through postcards, tap to read, and see how it feels.
            </p>
          </div>
          <div style={{
            background:     '#EEEEF5',
            borderRadius:   mobile ? 20 : 28,
            padding:        mobile ? '40px 16px 32px' : '60px 24px',
            display:        'flex',
            justifyContent: 'center',
            alignItems:     'center',
            border:         '1px solid rgba(127,131,232,0.12)',
            boxShadow:      '0 4px 32px rgba(43,44,73,0.07)',
            overflowX:      'hidden',
          }}>
            <Deck
              cards={data.cards}
              renderCard={(item, onTap) => <PostCard {...item} stampUrl={item.stampUrl ?? ''} onClick={onTap} />}
              renderBack={(item, onClose) => <PostCardBack item={item} onClose={onClose} />}
            />
          </div>
        </div>
      </section>

      <Footer setPage={setPage}/>
    </div>
  )
}

// ─── Page: About ───────────────────────────────────────────────────────────────

function PageAbout({ setPage }: { setPage: (p: Page) => void }) {
  const mobile = useIsMobile()

  const avatarColors = [
    'linear-gradient(135deg, #7f83e8, #2b2c49)',
    'linear-gradient(135deg, #5ce8b5, #7f83e8)',
    'linear-gradient(135deg, #c5c5ff, #7f83e8)',
    'linear-gradient(135deg, #2b2c49, #7f83e8)',
  ]
  const team = ['A','B','C','D'].map((letter, i) => ({
    letter, gradient: avatarColors[i],
    name: 'Team Member', role: 'co-founder',
    bio: 'Replace this with a short, honest blurb about who this person is and what they bring to immi. Keep it human — no corporate bios.',
  }))

  return (
    <div style={{ paddingTop: 60 }}>

      {/* Hero */}
      <div style={{ padding: mobile ? '48px 24px 40px' : '80px 80px 60px', maxWidth:1100, margin:'0 auto' }}>
        <p style={{ fontFamily:'monospace', fontSize:11, letterSpacing:'-0.04em', color:'#7f83e8', textTransform:'uppercase', marginBottom:16 }}>about us</p>
        <h1 style={{ fontWeight:500, fontSize: mobile ? '36px' : 'clamp(36px,4vw,56px)', letterSpacing:'-0.03em', lineHeight:1.1, color:'#0f0f14', marginBottom:16, maxWidth:680 }}>
          a small team building something they actually believe in.
        </h1>
        <p style={{ fontWeight:300, fontSize: mobile ? 16 : 17, lineHeight:1.65, color:'#2b2c49', opacity:0.75, maxWidth:560, margin:0 }}>
          immi is entirely self-funded by a group of friends who got tired of what social media had become — and decided to build an alternative.
        </p>
      </div>

      {/* Story */}
      <section style={{ padding: mobile ? '48px 24px' : '60px 80px', background:'rgba(197,197,255,0.1)' }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <h2 style={{ fontWeight:500, fontSize: mobile ? 24 : 28, letterSpacing:'-0.03em', color:'#0f0f14', marginBottom:20 }}>why we built immi</h2>
          {[
            "We believe the most important moments in life happen when you aren't looking at a screen. But the tools we use to stay connected with people we love are designed to keep us scrolling, not thriving.",
            "So we started building something different. An app that measures success by the quality of your relationships — not the time you spend inside it. One that helps you share what matters with the people who matter, then gets out of your way.",
            "We're in the early stages, and we have a lot of plans. But the foundation is solid: real connection, real privacy, and a real commitment to building technology that serves people instead of exploiting them.",
          ].map((text, i) => (
            <p key={i} style={{ fontWeight:400, fontSize:16, lineHeight:1.75, color:'#2b2c49', opacity:0.8, marginBottom: i < 2 ? 16 : 0 }}>{text}</p>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: mobile ? '48px 24px 64px' : '80px 80px 100px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ marginBottom: mobile ? 32 : 48 }}>
            <p style={{ fontFamily:'monospace', fontSize:11, letterSpacing:'-0.04em', color:'#7f83e8', textTransform:'uppercase', marginBottom:12 }}>the team</p>
            <h2 style={{ fontWeight:500, fontSize:'clamp(24px,3vw,40px)', letterSpacing:'-0.03em', color:'#0f0f14', marginBottom:12 }}>the people behind immi</h2>
            <p style={{ fontWeight:300, fontSize:16, color:'#2b2c49', opacity:0.7, margin:0 }}>Four friends with a shared frustration and a shared belief that we can do better.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2,1fr)', gap:16 }}>
            {team.map(({ letter, gradient, name, role, bio }) => (
              <div key={letter} style={{
                border:'1.5px solid rgba(43,44,73,0.08)', borderRadius:20,
                padding: mobile ? 20 : 32,
                display:'flex', gap:20, alignItems:'flex-start',
              }}>
                <div style={{ width:52, height:52, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:gradient, fontWeight:500, fontSize:20, color:'#FCFCFF' }}>
                  {letter}
                </div>
                <div>
                  <h3 style={{ fontWeight:500, fontSize:17, letterSpacing:'-0.02em', color:'#0f0f14', marginBottom:4 }}>{name}</h3>
                  <p style={{ fontFamily:'monospace', fontSize:11, color:'#7f83e8', letterSpacing:'-0.03em', marginBottom:10 }}>{role}</p>
                  <p style={{ fontSize:14, fontWeight:400, lineHeight:1.65, color:'#2b2c49', opacity:0.7, margin:0 }}>{bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section style={{ background:'#0f0f14', padding: mobile ? '60px 24px' : '80px' }}>
        <div style={{ maxWidth:600 }}>
          <h2 style={{ fontWeight:500, fontSize:'clamp(24px,3vw,40px)', letterSpacing:'-0.03em', color:'#FCFCFF', marginBottom:16 }}>help us grow.</h2>
          <p style={{ fontWeight:300, fontSize:16, lineHeight:1.7, color:'rgba(252,252,255,0.55)', marginBottom:32 }}>
            immi is entirely self-funded by the team. If you believe in what we're building and want to help us get there faster, we'd appreciate any support.
          </p>
          <a href="https://gofund.me/7079b16fc" target="_blank" rel="noreferrer" style={{
            background:'#f2dc62', color:'#0f0f14', fontWeight:500,
            padding:'14px 28px', borderRadius:100, textDecoration:'none',
            fontSize:15, letterSpacing:'-0.01em', display:'inline-block',
          }}>
            support us on GoFundMe →
          </a>
        </div>
      </section>

      <Footer setPage={setPage}/>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [page, setPage] = useState<Page>('home')

  const handleSetPage = (p: Page) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <>
      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; overflow-x: hidden; background: #FCFCFF; }
      `}</style>
      <div style={{ fontFamily: 'var(--font-geist-sans, DM Sans, sans-serif)', color: '#2b2c49', background: '#FCFCFF' }}>
        <Nav page={page} setPage={handleSetPage}/>
        {page === 'home'  && <PageHome  setPage={handleSetPage}/>}
        {page === 'app'   && <PageApp   setPage={handleSetPage}/>}
        {page === 'about' && <PageAbout setPage={handleSetPage}/>}
      </div>
    </>
  )
}