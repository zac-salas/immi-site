'use client'

import { useIsMobile, Footer } from '@/components/PostCard/Shared'
import Deck from '@/components/PostCard/Deck/Deck'
import PostCard from '@/components/PostCard/PostCard/PostCard'
import PostCardBack from '@/components/PostCard/PostCard/PostCardBack'
import data from '@/components/PostCard/Types/PostCardData.json'

// ─── Page: App ────────────────────────────────────────────────────────────────

export default function PageApp() {
  const mobile = useIsMobile()

  const features = [
    {
      title: 'selective sharing',
      body: "Share updates with specific contacts. You decide exactly who sees what, every time.",
      icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    },
    {
      title: 'direct replies',
      body: "When someone receives your postcard they can reply — just to you. One to many, one to one.",
      icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    },
    {
      title: 'no algorithm',
      body: "What you see is what the people you care about actually shared. No feed ranked by engagement.",
      icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    },
    {
      title: 'your circle',
      body: "Build a curated circle of the people you actually want to stay in touch with.",
      icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    },
    {
      title: 'share updates',
      body: "Post moments, thoughts, or life updates and send them to only the people you want to see them.",
      icon: <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
    },
    {
      title: 'private by design',
      body: "Your data is yours. We don't sell it, we don't use it to target you, and we never will.",
      icon: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    },
  ]

  return (
    <div style={{ paddingTop: 80 }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ padding: mobile ? '48px 28px 32px' : '80px 80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '-0.04em', color: '#7f83e8', textTransform: 'uppercase', marginBottom: 16 }}>the app</p>
        <h1 style={{
          fontWeight: 500,
          fontSize: mobile ? 36 : 'clamp(36px,4vw,52px)',
          letterSpacing: '-0.03em', lineHeight: 1.1,
          color: '#0f0f14', marginBottom: 16, maxWidth: 560,
        }}>
          built to bring you closer,<br/>not keep you scrolling.
        </h1>
        <p style={{ fontWeight: 300, fontSize: mobile ? 16 : 17, lineHeight: 1.65, color: '#6F6F76', maxWidth: 500, margin: 0 }}>
          immi gives you the tools to share, connect, and stay close with the people who matter — without the noise.
        </p>
      </div>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section style={{ padding: mobile ? '32px 28px 60px' : '60px 80px 100px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : 'repeat(3,1fr)',
          gap: 16,
        }}>
          {features.map(({ icon, title, body }) => (
            <div key={title} style={{
              background: '#FCFCFF',
              border: '1.5px solid rgba(43,44,73,0.08)',
              borderRadius: 18, padding: mobile ? 22 : 28,
            }}>
              <div style={{
                width: 40, height: 40,
                background: 'rgba(197,197,255,0.25)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18, color: '#7f83e8',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {icon}
                </svg>
              </div>
              <h3 style={{ fontWeight: 500, fontSize: 16, letterSpacing: '-0.02em', color: '#0f0f14', marginBottom: 8 }}>{title}</h3>
              <p style={{ fontWeight: 400, fontSize: 13, lineHeight: 1.65, color: '#6F6F76', margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sandbox ───────────────────────────────────────────────────────── */}
      <section style={{ padding: mobile ? '48px 16px' : '80px', background: 'rgba(197,197,255,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: mobile ? 32 : 48, padding: mobile ? '0 8px' : 0 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '-0.04em', color: '#7f83e8', textTransform: 'uppercase', marginBottom: 12 }}>try it yourself</p>
            <h2 style={{ fontWeight: 500, fontSize: 'clamp(24px,3vw,38px)', letterSpacing: '-0.03em', color: '#0f0f14', marginBottom: 12 }}>try immi right here</h2>
            <p style={{ fontWeight: 300, fontSize: 15, lineHeight: 1.6, color: '#6F6F76', margin: 0 }}>
              Swipe through postcards, tap to read, and see how it feels.
            </p>
          </div>
          <div style={{
            background: '#f8f8ff', borderRadius: mobile ? 20 : 28,
            padding: mobile ? '40px 16px 32px' : '60px 24px',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            border: '1px solid rgba(127,131,232,0.12)',
            boxShadow: '0 4px 32px rgba(43,44,73,0.07)',
            overflowX: 'hidden',
            position: 'relative',
          }}>
            {/* Restart + fullscreen — top-right of sandbox */}
            <div style={{
              position: 'absolute', top: 12, right: 12,
              display: 'flex', gap: 6, zIndex: 10,
            }}>
              <button
                onClick={() => {
                  const deck = document.querySelector('[data-deck-restart]') as HTMLButtonElement
                  deck?.click()
                }}
                title="Restart demo"
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: '1.5px solid rgba(111,111,118,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(4px)',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#6F6F76',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 4a6 6 0 1 1 0 6"/><polyline points="1 1 1 4 4 4"/>
                </svg>
              </button>
              <button
                onClick={() => {
                  const deck = document.querySelector('[data-deck-fullscreen]') as HTMLButtonElement
                  deck?.click()
                }}
                title="Fullscreen"
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: '1.5px solid rgba(111,111,118,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(4px)',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#6F6F76',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"/>
                </svg>
              </button>
            </div>
            <Deck
              cards={data.cards}
              renderCard={(item, onTap) => <PostCard {...item} stampUrl={item.stampUrl ?? ''} onClick={onTap} />}
              renderBack={(item, onClose) => <PostCardBack item={item} onClose={onClose} />}
            />
          </div>
        </div>
      </section>

      <h2 style={{ fontWeight: 500, fontSize: 'clamp(24px,3vw,38px)', letterSpacing: '-0.03em', color: '#0f0f14', marginBottom: 12 }}>
        Like what you see? Download immi for yourself.
      </h2>

      <Footer />
    </div>
  )
}