'use client'

import { useState, useEffect, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  animate,
} from 'framer-motion'
import Image from 'next/image'
import { getPaletteSync } from 'colorthief'
import type { PostcardRow } from '@/lib/supabase'
import { useIsMobile } from '@/components/PostCard/Shared'

const SP_FLIP   = { type: 'spring' as const, damping: 22, stiffness: 380, mass: 0.35 }
const SP_RETURN = { type: 'spring' as const, damping: 18, stiffness: 120, mass: 0.8 }

// TODO: replace these with immi's actual store listings.
const APP_STORE_URL  = 'https://apps.apple.com/us/app/immi/id6748417209'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.suryamoney.immiapp'
const WEB_URL         = 'https://immi.community/create'

function getCreateLink() {
  if (typeof navigator === 'undefined') return WEB_URL
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
  if (isIOS) return APP_STORE_URL
  if (/android/i.test(ua)) return PLAY_STORE_URL
  return WEB_URL
}

const DEFAULT_PALETTE = [
  'hsl(235, 65%, 55%)',
  'hsl(240, 65%, 88%)',
  'hsl(225, 65%, 97%)',
]

function getCardSize() {
  if (typeof window === 'undefined') return { w: 320, h: 460 }
  const vw = window.innerWidth
  const vh = window.innerHeight
  const w  = Math.round(Math.min(vw * 0.88, 380))
  const h  = Math.round(Math.min(vh * 0.72, 520))
  return { w, h }
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

// Converts an "rgb(r, g, b)" string into HSL, then forces saturation and
// lightness into a vibrant range while preserving the original hue. This
// guarantees punchy gradient colors even from desaturated/dim source
// photos, rather than just scaling whatever saturation was already there.
function vibrantize(rgbCss: string, minSat = 0.65, lightness = 0.55): string {
  const match = rgbCss.match(/\d+/g)
  if (!match) return rgbCss
  const [r, g, b] = match.map(Number).map(v => v / 255)

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  const d = max - min

  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  const sat = Math.max(d === 0 ? minSat : d / (1 - Math.abs(2 * l - 1)), minSat)

  return `hsl(${Math.round(h * 360)}, ${Math.round(sat * 100)}%, ${Math.round(lightness * 100)}%)`
}

// Converts an "hsl(...)" string into "hsla(..., alpha)" for low-opacity
// gradient stops.
function withOpacity(hslCss: string, alpha: number) {
  return hslCss.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`)
}

export default function CardView({ card, shareUrl, onMakeAnother }: { card: PostcardRow; shareUrl?: string; onMakeAnother?: () => void }) {
  const mobile = useIsMobile()
  const [showShareOverlay, setShowShareOverlay] = useState(!!shareUrl)
  const [copied, setCopied] = useState(false)
  const [tiltPermissionNeeded, setTiltPermissionNeeded] = useState(false)

  function copyLink() {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const [isFlipped, setIsFlipped] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [createLink, setCreateLink] = useState(WEB_URL)
  const [stampRot]  = useState(() => Math.random() * 8 - 4)
  const [cardSize, setCardSize] = useState({ w: 320, h: 460 })
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE)

  const expiresIn = Math.max(
    0,
    Math.round((new Date(card.expires_at).getTime() - Date.now()) / (1000 * 60 * 60))
  )

  useEffect(() => {
    function update() { setCardSize(getCardSize()) }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Extract a 3-color palette from the postcard's image for the ambient
  // background gradient (Apple Music-style). Runs whenever the image
  // changes. crossOrigin is required to read pixel data off a canvas for
  // images hosted on Supabase Storage (a different origin from the app);
  // Supabase's hosted Storage permits anonymous cross-origin reads by
  // default, so no bucket-level CORS config is needed for this to work.
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = card.image_url
    img.onload = () => {
      try {
        const colors = getPaletteSync(img, { colorCount: 3 })
        if (colors) setPalette(colors.map(c => vibrantize(c.css())))
      } catch {
        // Extraction can fail on decode issues or edge-case images —
        // keep whatever palette was already showing rather than break
        // the page.
      }
    }
  }, [card.image_url])

  const CARD_W = cardSize.w
  const CARD_H = cardSize.h

  function getBounds() {
    const maxX = window.innerWidth  / 2 - CARD_W / 2
    const maxY = window.innerHeight / 2 - CARD_H / 2
    return { minX: -maxX, maxX, minY: -maxY, maxY }
  }

  // Free-drag position
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Mouse-based tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotX = useSpring(mouseY, { damping: 5, stiffness: 50, mass: 0.5 })
  const rotY = useSpring(mouseX, { damping: 5, stiffness: 50, mass: 0.5 })

  // Shadow depth follows drag distance from center
  const shadowOpacity = useTransform(x, [-100, 0, 100], [0.22, 0.12, 0.22])

  // Flip faces
  const flipY        = useMotionValue(0)
  const frontOpacity  = useTransform(flipY, [0, 89, 90],   [1, 1, 0])
  const backOpacity   = useTransform(flipY, [89, 90, 180], [0, 1, 1])
  const frontRotateY  = useTransform(flipY, v => `${v}deg`)
  const backRotateY   = useTransform(flipY, v => `${v - 180}deg`)

  const isDragging = useRef(false)
  const cardRef     = useRef<HTMLDivElement>(null)
  const idleTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  function resetToCenter() {
    animate(x, 0, SP_RETURN)
    animate(y, 0, SP_RETURN)
  }

  function scheduleReset() {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(resetToCenter, 1000)
  }

  useEffect(() => {
    setIsMounted(true)
    setCreateLink(getCreateLink())
  }, [])

  useEffect(() => {
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current) }
  }, [])

  useEffect(() => {
    animate(flipY, isFlipped ? 180 : 0, SP_FLIP)
  }, [isFlipped]) // eslint-disable-line

  useEffect(() => {
    if (!isMounted) return
    x.set(0)
    y.set(0)
  }, [isMounted]) // eslint-disable-line

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isDragging.current) return
      const cardEl = cardRef.current
      if (!cardEl) return
      const rect = cardEl.getBoundingClientRect()
      const cx = rect.left + rect.width  / 2
      const cy = rect.top  + rect.height / 2
      const dx = (e.clientX - cx) / (window.innerWidth  / 2)
      const dy = (e.clientY - cy) / (window.innerHeight / 2)
      mouseX.set(dx * 12)
      mouseY.set(dy * -10)
    }
    function handleMouseLeave() {
      if (isDragging.current) return
      mouseX.set(0)
      mouseY.set(0)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isMounted]) // eslint-disable-line

  // Gyroscope tilt (mobile) — feeds the same mouseX/mouseY motion values
  // the desktop mouse-tilt uses, so it goes through the same spring and
  // the same rotX/rotY transform. Phones don't fire mousemove, so without
  // this the card would just sit flat on mobile.
  const handleOrientationRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null)
  if (!handleOrientationRef.current) {
    handleOrientationRef.current = (e: DeviceOrientationEvent) => {
      if (isDragging.current) return
      const beta  = e.beta  ?? 90  // front-back tilt; ~45deg is a natural "reading" angle
      const gamma = e.gamma ?? 45  // left-right tilt, -90 to 90
      const nx = clamp(gamma / 45, -1, 1)
      const ny = clamp((beta - 45) / 45, -1, 1)
      mouseX.set(nx * 12)
      mouseY.set(ny * -10)
    }
  }

  useEffect(() => {
    if (!isMounted || !mobile || typeof window === 'undefined') return
    const DOE = (window as any).DeviceOrientationEvent
    const handler = handleOrientationRef.current!

    if (DOE && typeof DOE.requestPermission === 'function') {
      // iOS 13+ — motion access needs an explicit user gesture first
      setTiltPermissionNeeded(true)
      return
    }

    window.addEventListener('deviceorientation', handler)
    return () => window.removeEventListener('deviceorientation', handler)
  }, [isMounted, mobile]) // eslint-disable-line

  async function requestTiltPermission() {
    try {
      const DOE = (window as any).DeviceOrientationEvent
      const result = await DOE.requestPermission()
      if (result === 'granted') {
        setTiltPermissionNeeded(false)
        window.addEventListener('deviceorientation', handleOrientationRef.current!)
      }
    } catch {
      // denied or unavailable — card just stays flat, no harm done
    }
  }

  function handleTap() {
    if (isDragging.current) return
    setIsFlipped(v => !v)
    scheduleReset()
  }

  if (!isMounted) return null

  // Each extracted color is placed at two different positions, rather than
  // one, so the ambient background reads as woven/multipoint instead of
  // three isolated blobs. Opacity is kept low per-blob since overlapping
  // semi-transparent layers compound — 6 blobs at high alpha stack into a
  // much darker result than any single value suggests.
  const c0 = withOpacity(palette[0], 0.16)
  const c1 = withOpacity(palette[1] ?? palette[0], 0.12)
  const c2 = withOpacity(palette[2] ?? palette[0], 0.16)
  const bgGradient = `
    radial-gradient(circle at 8% 12%,  ${c0}, transparent 45%),
    radial-gradient(circle at 68% 78%, ${c0}, transparent 40%),
    radial-gradient(circle at 88% 8%,  ${c1}, transparent 45%),
    radial-gradient(circle at 25% 92%, ${c1}, transparent 40%),
    radial-gradient(circle at 50% 50%, ${c2}, transparent 50%),
    radial-gradient(circle at 92% 60%, ${c2}, transparent 40%),
    #ffffff
  `

  return (
    <div style={{
      position:   'fixed',
      inset:      0,
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow:   'hidden',
      background: bgGradient,
      transition: 'background 0.6s ease',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>

      {/* Expiry badge — top, replaces the old static header */}
      <div style={{

        position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 50, textAlign: 'center', pointerEvents: 'none',
      }}>
        <Image src="/images/immi.svg" alt="immi" width={28} height={28} style={{ marginBottom: 8, paddingLeft: 48, paddingRight:48, opacity:0.5 }} />
        <p style={{
          fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'rgba(43,44,73,0.4)', margin: 0,
        }}>
          expires in {expiresIn}h
        </p>
      </div>

      {mobile && tiltPermissionNeeded && (
        <button
          onClick={requestTiltPermission}
          style={{
            position: 'absolute', top: 72, left: '50%', transform: 'translateX(-50%)',
            zIndex: 50, display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', background: 'rgba(127,131,232,0.12)',
            border: '1px solid rgba(127,131,232,0.3)', borderRadius: 100,
            cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#7f83e8',
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 2v10l6 3" />
          </svg>
          tap to enable tilt
        </button>
      )}

      {/* The card */}
      <motion.div
        ref={cardRef}
        drag
        dragMomentum={false}
        dragElastic={0}
        initial={{ opacity: 0, y: 80, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1, type: 'spring', damping: 22, stiffness: 120, mass: 0.9, delay: 0.15 }}
        style={{
          x, y,
          width:  CARD_W,
          height: CARD_H,
          position: 'relative',
          zIndex: 10,
          perspective: 1200,
          cursor: isFlipped ? 'default' : 'grab',
          touchAction: 'none',
        }}
        onDrag={() => {
          const { minX, maxX, minY, maxY } = getBounds()
          x.set(clamp(x.get(), minX, maxX))
          y.set(clamp(y.get(), minY, maxY))
        }}
        onDragStart={() => {
          isDragging.current = true
          mouseX.set(0)
          mouseY.set(0)
        }}
        onDragEnd={() => {
          setTimeout(() => { isDragging.current = false }, 50)
          scheduleReset()
        }}
        whileDrag={{ cursor: 'grabbing' }}
      >
        <motion.div style={{
          position: 'absolute', inset: 0,
          rotateX: rotX, rotateY: rotY,
          transformStyle: 'preserve-3d',
        }}>

          {/* Shadow */}
          <motion.div style={{
            position: 'absolute', bottom: -20, left: '10%', right: '10%',
            height: 40, borderRadius: '50%', background: 'rgba(0, 0, 0, 0.09)',
            filter: 'blur(16px)', transform: 'scaleY(0.4)', opacity: shadowOpacity,
          }} />

          {/* Front face */}
          <motion.div
            onClick={handleTap}
            style={{
              position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden',
              background: '#FAFBFF', padding: 16,
              opacity: frontOpacity, rotateY: frontRotateY,
              transformOrigin: 'center center',
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'grab',
              pointerEvents: isFlipped ? 'none' : 'auto',
            }}
            whileHover={{ boxShadow: '0 16px 56px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)' }}
          >
            <div style={{ height: 321, borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
              <Image
                src={card.image_url}
                alt="postcard photo"
                width={329}
                height={321}
                style={{ objectFit: 'cover', width: '100%', height: '100%', userSelect: 'none', WebkitUserDrag: 'none' } as React.CSSProperties}
                draggable={false}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: '"EB Garamond", Georgia, serif', fontSize: 20, fontWeight: 500,
                  color: '#13131B', margin: '0 0 4px',
                }}>
                  {card.recipient_name ? ` ${card.recipient_name}` : 'A postcard for you'}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, borderBottom: '1px solid rgba(111,111,118,0.17)', paddingBottom: 2 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#6F6F76', fontWeight: 500 }}>From:</span>
                  <span style={{ fontFamily: '"Caveat", cursive', fontSize: 20, color: '#414149', lineHeight: 1.2 }}>{card.sender_name}</span>
                </div>
              </div>
              <Image
                src={card.stamp_url}
                alt="stamp"
                width={56}
                height={56}
                style={{ objectFit: 'cover', transform: `rotate(${stampRot}deg)`, flexShrink: 0 }}
                draggable={false}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, paddingTop: 16, color: '#7E7F83', fontStyle: 'italic', fontSize: 14 }}>
              <span>tap to read</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </motion.div>

          {/* Back face */}
          <motion.div
            style={{
              position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden',
              background: '#FAFBFF',
              opacity: backOpacity, rotateY: backRotateY,
              transformOrigin: 'center center',
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex', flexDirection: 'column',
              pointerEvents: isFlipped ? 'auto' : 'none',
              padding: 16,
            }}
          >
            <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: '1.5px dotted rgba(111,111,118,0.25)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <button
                onClick={() => { setIsFlipped(false); scheduleReset() }}
                style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(19,19,27,0.04)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, color: '#13131B', fontWeight: 500,
                }}
              >✕</button>
              <div style={{ flex: 1, paddingTop: 8 }}>
                <p style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: 20, fontWeight: 500, color: '#13131B', margin: '0 0 4px' }}>
                  {card.recipient_name ? ` ${card.recipient_name}` : 'A postcard for you'}
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, borderBottom: '.5px solid rgba(111,111,118,0.22)', paddingBottom: 2 }}>
                  <span style={{ fontFamily: 'monospace', color: '#6F6F76', fontSize: 12, fontWeight: 500 }}>From:</span>
                  <span style={{ fontFamily: '"Caveat", cursive', color: '#414149', fontSize: 18, lineHeight: 1.2 }}>{card.sender_name}</span>
                </div>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                <Image src={card.stamp_url} alt="stamp" width={52} height={52} style={{ objectFit: 'cover', width: '100%', height: '100%' }} draggable={false} />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0 0', scrollbarWidth: 'none', touchAction: 'pan-y', overscrollBehavior: 'contain' }}>
              <p style={{
                fontFamily: '"DM Sans", sans-serif', fontSize: 16, lineHeight: 1.5,
                color: '#13131B', margin: 0, whiteSpace: 'pre-wrap',
                userSelect: 'text', WebkitUserSelect: 'text',
              }}>
                {card.message}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0 0' }}>
              <a
                href={createLink}
                target={createLink === WEB_URL ? undefined : '_blank'}
                rel={createLink === WEB_URL ? undefined : 'noopener noreferrer'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#585bbb21', color: '#13131B', border: 'none',
                  borderRadius: 12, padding: '12px 22px', cursor: 'pointer',
                  fontFamily: '"DM Sans", sans-serif', fontSize: 12, fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Send your own postcard
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Hint text */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.8 }}
        style={{
          position: 'absolute', bottom: 32, transform: 'translateX(-50%)',
          fontFamily: '"DM Sans", sans-serif', fontSize: 13,
          color: 'rgba(43,44,73,0.35)', fontStyle: 'italic',
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}
      >
        drag me anywhere
      </motion.p>

      {/* Owner-only dismissible copy-link overlay — only renders when this
          CardView is being shown to the person who just created the
          postcard, not to recipients opening a shared link. */}
      {shareUrl && showShareOverlay && (
        <>
          {/* Backdrop — darkens and blurs the postcard behind the modal
              until the link is copied, so attention stays on the copy
              action rather than the draggable card underneath. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: copied ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: copied ? 0.4 : 0.5, delay: copied ? 0 : 0.5 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 59,
              background: 'rgba(15,15,22,0.45)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              pointerEvents: copied ? 'none' : 'auto',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{
              position: 'fixed', top: '50%',
              zIndex: 60, width: 'min(90vw, 380px)',
              background: '#FAFBFF', borderRadius: 16, padding: '16px 18px',
              boxShadow: '0 12px 40px rgba(43,44,73,0.18), 0 2px 8px rgba(43,44,73,0.08)',
            }}
          >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, fontWeight: 600, color: '#0f0f14', margin: 0 }}>
              your postcard is ready
            </p>
            <button
              onClick={() => setShowShareOverlay(false)}
              aria-label="Dismiss"
              style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(19,19,27,0.06)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#13131B', lineHeight: 1,
              }}
            >✕</button>
          </div>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: '#6F6F76', margin: '0 0 12px' }}>
            save this link — it won't be sent to you again.
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#EEEEF5', borderRadius: 8, padding: '10px 12px',
          }}>
            <span style={{
              flex: 1, fontFamily: 'monospace', fontSize: 12,
              color: '#2b2c49', overflow: 'hidden', textAlign: 'left',
              whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            }}>
              {shareUrl.replace('https://', '')}
            </span>
            <button
              onClick={copyLink}
              style={{
                background: '#2b2c49', color: '#fff', border: 'none',
                borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', flexShrink: 0, fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {onMakeAnother && (
            <button
              onClick={onMakeAnother}
              style={{
                width: '100%', marginTop: 10, background: 'none', border: 'none',
                color: '#7f83e8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: '"DM Sans", sans-serif', textAlign: 'center', padding: 0,
              }}
            >
              make another postcard
            </button>
          )}
          </motion.div>
        </>
      )}
    </div>
  )
}