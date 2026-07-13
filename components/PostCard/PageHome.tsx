'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useIsMobile, Footer, StoreBtn } from '@/components/PostCard/Shared'
import cardstyles from '@/components/PostCard/PostCard/postcard.module.css'

// Card data — each card pairs its postcard image with its pre-blurred bg

const HERO_CARDS = [
  {
    imageUrl: '/images/cafecard.png',
    bgUrl:    '/images/cafeblur.png',
    title:    'Timeless Conversations',
    sender:   'An old friend',
    stampUrl: '/images/Casual Stamp.png',
    stampRot: -3,
  },
  {
    imageUrl: '/images/freakcard.png',
    bgUrl:    '/images/freakblur.png',
    title:    'Check Out Le Freak',
    sender:   'That One Guy',
    stampUrl: '/images/Entertainment Stamp.png',
    stampRot: 4,
  },
  {
    imageUrl: '/images/doodlecard.png',
    bgUrl:    '/images/doodleblur.png',
    title:    'Doodle For The Day',
    sender:   'Your artsy friend',
    stampUrl: '/images/Art Stamp.png',
    stampRot: -2,
  },
  {
    imageUrl: '/images/yunquecard.png',
    bgUrl:    '/images/yunqueblur.png',
    title:    'Love my remote work view',
    sender:   'Your Friend on a Tuesday',
    stampUrl: '/images/Nature Stamp.png',
    stampRot: -1,
  },
  {
    imageUrl: '/images/phantomcard.png',
    bgUrl:    '/images/phantomblur.png',
    title:    'Gotta See the Phantom',
    sender:   'Your Music Snob Friend',
    stampUrl: '/images/Entertainment Stamp.png',
    stampRot: 2,
  },
  {
    imageUrl: '/images/bbqcard.png',
    bgUrl:    '/images/bbqblur.png',
    title:    'Mooooooooooooo',
    sender:   'Your Neighbor',
    stampUrl: '/images/Food Stamp.png',
    stampRot: -3,
  },
]


// HeroCardStack

function HeroCardStack() {
  const mobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [activeIdx, setActiveIdx] = useState(0)

  // useLayoutEffect (not useEffect) is the actual fix for the initial-load
  // stutter — useEffect runs after the browser's first paint, so there was
  // a real one-frame flash of the stack at scale(1) (full size) before this
  // corrected it. useLayoutEffect runs synchronously before paint, so the
  // right scale is already applied by the time anything hits the screen.
  useLayoutEffect(() => {
    
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const availH = el.offsetHeight
      const availW = el.offsetWidth
      const scaleByH = (availH * 0.72) / 475
      const scaleByW = (availW * 0.65) / 361
      setScale(Math.min(scaleByH, scaleByW, 1))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Clean, single-source loop with no nested state timers
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % HERO_CARDS.length)
    }, 2500) // Increased slightly to let transitions breathe
    return () => clearInterval(interval)
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '120%', overflow: 'hidden' }}>
      
      {/* ── Background Crossfade (GPU-accelerated layers) ── */}
      {HERO_CARDS.map((card, idx) => {
        const isActive = idx === activeIdx
        return (
          <img
            key={`bg-${idx}`}
            src={card.bgUrl}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '30% center',
              opacity: isActive ? 0.45 : 0,
              filter: 'saturate(0.65) brightness(0.85)',
              transition: 'opacity 1200ms cubic-bezier(0.25, 1, 0.5, 1)', // Sweeping, buttery crossfade
              willChange: 'opacity',
              zIndex: isActive ? 1 : 0,
              paddingTop: mobile ? 'calc(20px + env(safe-area-inset-top))' : 0,
              
            }}
          />
        )
      })}

      {/* ── Card Stack Display Engine ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
      }}>
        <div style={{ 
          position: 'relative', 
          transform: `scale(${scale})`, 
          transformOrigin: 'center center',
          transition: 'transform 300ms ease-out',
        }}>

          {/* Static Background Aesthetic Cards */}
          <div style={{
            position: 'absolute', inset: 0,
            background: '#FAFBFF', borderRadius: 16,
            transform: 'rotate(-6deg) translateY(24px) translateX(-14px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: '#FAFBFF', borderRadius: 16,
            transform: 'rotate(3.5deg) translateY(12px) translateX(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }} />

          {/* Card Rendering Stack */}
          {HERO_CARDS.map((card, idx) => {
            const isActive = idx === activeIdx
            // Target the card directly preceding the current active index to track the swipe exit
            const isOutgoing = idx === (activeIdx === 0 ? HERO_CARDS.length - 1 : activeIdx - 1)
            const isIncoming = !isActive && !isOutgoing

            return (
              <div
                key={`card-${idx}`}
                className={cardstyles.card}
                style={{
                  position: isActive ? 'relative' : 'absolute',
                  top: 0, left: 0,
                  
                  // Motion State Profile
                  transform: isActive 
                    ? 'rotate(-1deg) translateY(0px)' 
                    : isOutgoing 
                    ? 'rotate(-3deg) translatex(-110px) scale(0.96)' // Fluid flying exit
                    : 'rotate(-1deg) translateY(20px) scale(0.95)',  // Subtle waiting entrance from below
                  
                  opacity: isActive ? 1 : 0,
                  
                  // Unique timing splits for exit vs entry behavior
                  transition: isActive
                    ? 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1), opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)'
                    : 'transform 700ms cubic-bezier(0.3, 0, 0, 1), opacity 550ms ease-in',
                  
                  boxShadow: isActive ? '0 24px 64px rgba(0,0,0,0.22)' : '0 8px 24px rgba(0,0,0,0.15)',
                  pointerEvents: isActive ? 'auto' : 'none',
                  zIndex: isActive ? 3 : isOutgoing ? 2 : 1,
                  willChange: 'transform, opacity',
                }}
              >
                <div className={cardstyles.cardTop}>
                  <Image className={cardstyles.pic} src={card.imageUrl} alt={card.title} width={329} height={321} priority={idx === 0} />
                </div>
                <div className={cardstyles.stampTitle}>
                  <div className={cardstyles.copy}>
                    <p className={cardstyles.title}>{card.title}</p>
                    <div className={cardstyles.fromLine}>
                      <p className={cardstyles.from}>From:</p>
                      <p className={cardstyles.name}>{card.sender}</p>
                    </div>
                  </div>
                  <Image 
                    className={cardstyles.stamp} 
                    src={card.stampUrl} 
                    alt="stamp" 
                    width={64} 
                    height={64} 
                    style={{ transform: `rotate(${card.stampRot}deg)` }} 
                  />
                </div>
                <div className={cardstyles.tap}>
                  <p>tap to read</p>
                  <svg className={cardstyles.arrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}
export default function PageHome() {
  const mobile = useIsMobile()
  const [stacked, setStacked] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1150px)')
    setStacked(mq.matches)
    const h = (e: MediaQueryListEvent) => setStacked(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  return (
    <div style={{  backgroundImage: "url(/images/bgTexture.svg)", paddingTop: mobile ? 0 : 0}}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {stacked ? (
        <section style={{ display: 'flex', flexDirection: 'column',  height: '102vh' }}>

          {/* Photo panel full width on mobile, leads the page */}
          <div style={{
            borderRadius: '0',
            overflow: 'hidden',
            // height: 'calc(100vw + 160px)',
            height: '105dvh',
            minHeight: 420,
            position: 'relative',
            // paddingTop: 190,
            boxSizing: 'content-box',
          }}>
            <HeroCardStack />

            {/* Softens the seam between the status-bar-adjacent strip and
                the vibrant hero photo below. Can't do anything about the
                Dynamic Island shape itself — that's OS-rendered and always
                opaque black regardless of page content — but the area
                around it is ours, and a hard flat-to-vibrant cutoff there
                reads as broken where a gradient reads as intentional. */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 'calc(140px + env(safe-area-inset-top))',
              background: 'linear-gradient(to bottom, rgba(245,245,252,0.9), rgba(245,245,252,0) 100%)',
              pointerEvents: 'none',
              zIndex: 5,
            }} />
          </div>

          {/* Copy beneath */}
          <div style={{ padding: '36px 24px 48px' }}>
            <h1 style={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 500,
              fontSize: 34,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#2b2c49',
              marginBottom: 16,
            }}>
              <span style={{ whiteSpace: 'nowrap' }}>
                <span style={{}}>More </span>
                <img 
                  src="/images/connecting.svg" 
                  alt="connecting"
                  style={{ 
                    height: 'clamp(42px, 3.8vw, 56px)',
                    width: 'auto',
                    verticalAlign: 'middle',
                    display: 'inline-block',
                  }} 
                /> </span>
                <br />
              <span style={{ color: '#2b2c49' }}>less </span>noise
            </h1>

            <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: 16, lineHeight: 1.65, color: '#6F6F76', marginBottom: 28 }}>
              Stop keeping tabs. Start keeping touch.
            </p>

            <div style={{ display: 'inline-block', gap: 10 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <StoreBtn store="ios" />
                <StoreBtn store="android" />
              </div>
            <Link
                href="/create"
                style={{
                    marginTop: 18,
                    fontSize: 13, color: '#7f83e8',
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 500, padding: 0,
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(127,131,232,0.3)',
                    textUnderlineOffset: 3,
                    display: 'flex', alignItems: 'center', gap: 4,
                    letterSpacing: '-0.01em',
                }}
                >
                or make a free postcard →
            </Link>
            </div>
          </div>

        </section>
      ) : (
        <div style={{ maxWidth: 1600, margin: '0 auto', width: '100%',  height: '100vh', paddingTop: 'min(5vh, 160px)', }}>
        <section style={{
          minHeight: 'calc(100vh - 80px)',
          maxHeight: 900,
          padding: '40px 60px',
          display: 'grid',
          gridTemplateColumns: 'minmax(auto, 480px) 1fr',
          gap: 72,
          alignItems: 'center',
          boxSizing: 'border-box',
         
        }}>

          {/* LEFT — copy */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{  }}>
              <h1 style={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(36px, 3.2vw, 48px)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                color: '#2b2c49',
                marginBottom: 0,
              }}>
                <span style={{ }}>More </span>
                  <img 
                    src="/images/connecting.svg" 
                    alt="connecting"
                    style={{ 
                      height: 'clamp(42px, 3.3vw, 56px)',
                      width: 'auto',
                      verticalAlign: 'middle',
                      display: 'inline-block',
                      color: '#7f83e8',
                      paddingBottom: 2,
                    }} 
                  />
                  <br />
                <span style={{ color: '#2b2c49' }}>less </span>noise
              </h1>
              <hr style={{ borderColor: '#e0e0e0', margin: '4px 0px 8px 0px' }}></hr>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: 16, lineHeight: 1.65, color: '#6F6F76', marginBottom: 32 }}>
                Stop keeping tabs. Start keeping touch.
              </p>

              <div style={{ display: 'inline-block', gap: 10 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <StoreBtn store="ios" />
                <StoreBtn store="android" />
              </div>
            <Link
                href="/create"
                style={{
                    marginTop: 18,
                    fontSize: 13, color: '#7f83e8',
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 500, padding: 0,
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(127,131,232,0.3)',
                    textUnderlineOffset: 3,
                    display: 'flex', alignItems: 'center', gap: 4,
                    letterSpacing: '-0.01em',
                }}
                >
                or make a free postcard →
            </Link>
            </div>
            </div>
          </div>

          {/* RIGHT — photo panel */}
          <div style={{
            borderRadius: 24,
            overflow: 'hidden',
            height: '70vh',
            maxHeight: 680,
            minHeight: 400,
            position: 'relative',
            
          }}>
            <HeroCardStack />
          </div>

        </section>
        </div>
      )}

      {/* ── VISION ───────────────────────────────────────────────────────── */}
      <section style={{ background: '#0f0f14', padding: mobile ? '60px 28px' : '100px 80px' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
          gap: mobile ? 40 : 80,
          alignItems: 'center',
        }}>
          <div>
            <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '-0.04em', color: '#c5c5ff', textTransform: 'uppercase', marginBottom: 20 }}>our vision</p>
            <h2 style={{ fontWeight: 500, fontSize: 'clamp(28px,3.5vw,44px)', lineHeight: 1.1, letterSpacing: '-0.03em', color: '#FCFCFF', marginBottom: 24 }}>
              We all know social media has strayed from connecting people. So we're doing something about it.
            </h2>
            <p style={{ fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: 'rgba(252,252,255,0.6)', marginBottom: 16 }}>
              At immi, we measure success in the quality of conversation — not in the number of minutes spent scrolling or how many followers, likes, or views you get.
            </p>
            <p style={{ fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: 'rgba(252,252,255,0.6)', margin: 0 }}>
              We're building something we genuinely believe in: a social platform that gets out of your way.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { title: 'Connection over consumption', body: 'Every design choice is made to facilitate authentic interactions, not passive consumption.' },
              { title: 'No growth hacks',             body: "We don't use FOMO or algorithms to keep you scrolling. We want you to spend less time on the app." },
              { title: 'Privacy is everything',       body: "A private network by design. We don't ask for more than we need and we never sell your data." },
            ].map(({ title, body }) => (
              <div key={title} style={{ borderLeft: '2px solid rgba(127,131,232,0.4)', paddingLeft: 20 }}>
                <h3 style={{ fontWeight: 500, fontSize: 15, letterSpacing: '-0.02em', color: '#FCFCFF', marginBottom: 6 }}>{title}</h3>
                <p style={{ fontWeight: 300, fontSize: 14, lineHeight: 1.6, color: 'rgba(252,252,255,0.45)', margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #c5c5ff 0%, #7f83e8 100%)', padding: mobile ? '60px 28px' : '100px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ maxWidth: 600 }}>
            <h2 style={{ fontWeight: 500, fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.1, letterSpacing: '-0.03em', color: '#0f0f14', marginBottom: 16 }}>
              ready to keep touch?
            </h2>
            <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.6, color: 'rgba(15,15,20,0.65)', marginBottom: 36 }}>
              immi is available now on iOS and Android.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <StoreBtn store="ios" light />
              <StoreBtn store="android" light />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}