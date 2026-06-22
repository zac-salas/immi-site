'use client'

/**
 * Deck.tsx — rebuilt around layoutId + MotionValues
 *
 * Architecture:
 * - `layoutId={item.id}` drives all deck↔list morphs via Framer Motion's
 *   shared element engine (compositor-thread layout transitions, no manual
 *   position math).
 * - Gesture transforms (drag rotation, drag offset) live exclusively in
 *   MotionValues — zero React re-renders during pointer movement.
 * - AnimatePresence handles exit animations cleanly per card.
 * - Cards are split into two separate render paths: DeckCard (stack) and
 *   ListRow (list). layoutId connects them across the two trees.
 */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  memo,
} from 'react'
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useMotionValue,
  useTransform,
  animate,
  type MotionValue,
} from 'framer-motion'
import Image from 'next/image'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PostCardData {
  id:        number | string
  imageUrl:  string
  stampUrl?: string
  title:     string
  sender:    string
  body?:     string
}

type CardStatus = 'unread' | 'read'

interface CardInstance {
  item:    PostCardData
  status:  CardStatus
  readAt?: Date
}

interface DeckProps {
  cards:       PostCardData[]
  renderCard:  (item: PostCardData, onTap: () => void) => React.ReactNode
  renderBack:  (item: PostCardData, onClose: () => void) => React.ReactNode
  onCardRead?: (item: PostCardData) => void
}

// ─── Config ────────────────────────────────────────────────────────────────────

const CARD_W       = 340
const CARD_H       = 480
const ROW_H        = 80
const ROW_GAP      = 8
const LIST_TOP     = 52
const MAX_VISIBLE  = 4
const SWIPE_DIST   = CARD_W * 0.38
const VELOCITY_ESC = 500
const EXIT_X       = CARD_W * 1.8

const STACK = [
  { y: 0,  scale: 1.000, rot:  0   },
  { y: 18, scale: 0.955, rot:  3.5 },
  { y: 36, scale: 0.915, rot: -5.2 },
  { y: 52, scale: 0.878, rot:  2.8 },
]

const SP_RETURN = { type: 'spring' as const, damping: 26, stiffness: 500, mass: 0.4 }

// Responsive expanded card size — computed at open time
function expandedSize() {
  if (typeof window === 'undefined') return { w: CARD_W, h: CARD_H }
  const vw = window.innerWidth
  const vh = window.innerHeight
  const isDesktop = vw >= 768
  const w = isDesktop ? Math.min(560, vw * 0.92) : Math.min(CARD_W, vw * 0.92)
  const h = isDesktop ? Math.min(720, vh * 0.88) : Math.min(vh * 0.88, 680)
  return { w: Math.round(w), h: Math.round(h) }
}
const SP_EXIT   = { type: 'spring' as const, damping: 20, stiffness: 280, mass: 0.5 }
const SP_FLIP   = { type: 'spring' as const, damping: 22, stiffness: 380, mass: 0.35 }
const SP_LAYOUT = { type: 'spring' as const, damping: 32, stiffness: 420, mass: 0.4 }

function seededRot(id: number | string): number {
  const n = typeof id === 'string'
    ? id.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0)
    : (id * 2654435761) | 0
  return ((n >>> 0) / 0xffffffff) * 16 - 8
}

function formatTimeAgo(date?: Date): string {
  if (!date) return ''
  const diff = Date.now() - date.getTime()
  const hrs  = Math.floor(diff / 3_600_000)
  if (hrs < 1)  return 'just now'
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Deck ──────────────────────────────────────────────────────────────────────

export default function Deck({ cards: initialCards, renderCard, renderBack, onCardRead }: DeckProps) {
  const [instances, setInstances] = useState<CardInstance[]>(() =>
    initialCards.map(item => ({ item, status: 'unread' as CardStatus }))
  )

  // Sync if cards prop changes
  const prevRef = useRef(initialCards)
  useEffect(() => {
    const prev = prevRef.current
    const changed = initialCards.length !== prev.length ||
      initialCards.some((c, i) => c.id !== prev[i]?.id)
    if (changed) {
      prevRef.current = initialCards
      setInstances(initialCards.map(item => ({ item, status: 'unread' as CardStatus })))
    }
  }, [initialCards])

  const [isListMode,   setIsListMode]   = useState(false)
  const [flippedId,    setFlippedId]    = useState<number | string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const restart = useCallback(() => {
    setInstances(initialCards.map(item => ({ item, status: 'unread' as CardStatus })))
    setIsListMode(false)
    setFlippedId(null)
  }, [initialCards])

  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Prevent page scroll on swipe but allow taps
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    let startX = 0, startY = 0
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY }
    const onMove  = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - startX)
      const dy = Math.abs(e.touches[0].clientY - startY)
      if (dx > 5 || dy > 5) e.preventDefault()
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove',  onMove,  { passive: false })
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove) }
  }, [])

  const unread = instances.filter(c => c.status === 'unread')
  const read   = instances
    .filter(c => c.status === 'read')
    .sort((a, b) => (b.readAt?.getTime() ?? 0) - (a.readAt?.getTime() ?? 0))

  // Button ref for absorption target
  const buttonRef = useRef<HTMLButtonElement>(null)

  const onRead = useCallback((id: number | string, item: PostCardData) => {
    setFlippedId(null)
    setInstances(prev => prev.map(c =>
      c.item.id === id ? { ...c, status: 'read', readAt: c.readAt ?? new Date() } : c
    ))
    onCardRead?.(item)
  }, [onCardRead])

  const onFlip      = useCallback((id: number | string) => setFlippedId(id),  [])
  const onCloseFlip = useCallback(() => setFlippedId(null), [])

  return (
    // LayoutGroup ensures layoutId transitions work across the deck/list trees
    <LayoutGroup>
      <div
        ref={wrapperRef}
        style={{
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          gap:             24,
          position:        'relative',
          backgroundColor: isFullscreen ? '#EEEEF5' : 'transparent',
          justifyContent:  isFullscreen ? 'center' : 'flex-start',
          minHeight:       isFullscreen ? '100vh' : CARD_H + 80,
          height:          isFullscreen ? '100vh' : CARD_H + 80,
          padding:         '0',
          boxSizing:       'border-box',
          userSelect:      'none',
          WebkitUserSelect:'none',
        }}
      >
        {/* Hidden triggers for PageCreate */}
        <button data-deck-restart onClick={restart} style={{ display: 'none' }} />
        <button data-deck-fullscreen onClick={toggleFullscreen} style={{ display: 'none' }} />

        {/* ── Deck view ─────────────────────────────────────────────────────── */}
        {!isListMode && (
          <div style={{
            position: 'relative',
            width:    CARD_W,
            height:   CARD_H + 40,
            display:  'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <SectionHeader label="Unread" count={`${unread.length} new`} />
            <AnimatePresence>
              {unread.length === 0 ? (
                <motion.div
                  key="all-caught-up"
                  initial={{ opacity: 0, scale: 0.92, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 12 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 420, mass: 0.4 }}
                  style={{
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    justifyContent: 'center',
                    gap:            12,
                    paddingBottom:  40,
                    zIndex: 999,
                  }}
                >
                  {/* Checkmark circle */}
                  <div style={{
                    width:           56,
                    height:          56,
                    borderRadius:    '50%',
                    backgroundColor: 'rgba(88,91,187,0.1)',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    marginBottom:    4,
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#585BBB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p style={{
                    fontFamily:    '"EB Garamond", Georgia, serif',
                    fontSize:      22,
                    fontWeight:    500,
                    color:         '#13131B',
                    letterSpacing: '-0.3px',
                    margin:        0,
                  }}>
                    All caught up
                  </p>
                  <p style={{
                    fontFamily:  '"DM Sans", sans-serif',
                    fontSize:    14,
                    color:       '#9E9EA6',
                    margin:      0,
                    fontStyle:   'italic',
                  }}>
                    you've read everything
                  </p>
                </motion.div>
              ) : (
                unread.slice(0, MAX_VISIBLE).map((instance, stackIndex) => (
                  <DeckCard
                    key={instance.item.id}
                    instance={instance}
                    stackIndex={stackIndex}
                    isTop={stackIndex === 0}
                    isFlipped={flippedId === instance.item.id}
                    buttonRef={buttonRef}
                    onRead={onRead}
                    onFlip={onFlip}
                    onCloseFlip={onCloseFlip}
                    renderCard={renderCard}
                    renderBack={renderBack}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        )}

        {/* List view */}
        {isListMode && (
          <div style={{
            width:           CARD_W,
            maxHeight:       isFullscreen ? 'calc(100vh - 120px)' : CARD_H,
            overflowY:       'auto',
            paddingBottom:   60,
            paddingTop:      8,
            scrollbarWidth:  'none',
            msOverflowStyle: 'none',
          } as React.CSSProperties}>
            {/* Unread section */}
            <SectionHeader label="Unread" count={`${unread.length} new`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: ROW_GAP, marginBottom: 24 }}>
              <AnimatePresence>
                {unread.map(instance => (
                  <ListRow
                    key={instance.item.id}
                    instance={instance}
                    onFlip={onFlip}
                    isFlipped={flippedId === instance.item.id}
                    onCloseFlip={onCloseFlip}
                    renderBack={renderBack}
                  />
                ))}
              </AnimatePresence>
              {unread.length === 0 && (
                <p style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 13, fontStyle: 'italic', color: '#9E9EA6',
                  padding: '8px 4px',
                }}>All caught up.</p>
              )}
            </div>

            {/* Read section */}
            {read.length > 0 && (
              <>
                <SectionHeader label="Read" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: ROW_GAP }}>
                  {read.map(instance => (
                    <ListRow
                      key={instance.item.id}
                      instance={instance}
                      onFlip={onFlip}
                      isFlipped={flippedId === instance.item.id}
                      onCloseFlip={onCloseFlip}
                      renderBack={renderBack}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── List card overlay — renders above list when a row is tapped ─── */}
        <AnimatePresence>
          {isListMode && flippedId !== null && (() => {
            const inst = instances.find(c => c.item.id === flippedId)
            if (!inst) return null
            return (
              <>
                {/* Backdrop */}
                <motion.div
                  key="list-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={onCloseFlip}
                  style={{
                    position:        'fixed',
                    inset:           0,
                    backgroundColor: 'rgba(10,10,20,0.45)',
                    backdropFilter:  'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    zIndex:          998,
                    cursor:          'pointer',
                  }}
                />
                {/* Expanded card — layoutId matches the row so it morphs up */}
                {(() => {
                  const { w, h } = expandedSize()
                  return (
                    <motion.div
                      key={`overlay-${flippedId}`}
                      layoutId={String(flippedId)}
                      transition={SP_LAYOUT}
                      style={{
                        position:     'fixed',
                        top:          '50%',
                        left:         '50%',
                        width:        w,
                        height:       h,
                        marginTop:    -(h / 2),
                        marginLeft:   -(w / 2),
                        borderRadius: 16,
                        overflow:     'hidden',
                        zIndex:       999,
                        boxShadow:    '0 24px 64px rgba(0,0,0,0.3)',
                      }}
                    >
                      {renderBack(inst.item, onCloseFlip)}
                    </motion.div>
                  )
                })()}
              </>
            )
          })()}
        </AnimatePresence>

        {/* Toggle button — pinned to bottom-center */}
        <motion.button
          ref={buttonRef}
          onClick={() => setIsListMode(v => !v)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            position:      isFullscreen ? 'fixed' : 'absolute',
            bottom:        isFullscreen ? 32 : 16,
            left:          '50%',
            marginLeft:    -60,
            width:         120,
            background:    '#585BBB',
            color:         '#fff',
            border:        'none',
            borderRadius:  999,
            padding:       '10px 0',
            cursor:        'pointer',
            fontSize:      14,
            fontFamily:    '"DM Sans", sans-serif',
            fontWeight:    600,
            letterSpacing: '-0.2px',
            boxShadow:     '0 4px 16px rgba(88,91,187,0.3)',
            zIndex:        100,
            textAlign:     'center',
          }}
        >
          {isListMode ? 'Back to Deck' : 'View Read'}
        </motion.button>
      </div>
    </LayoutGroup>
  )
}

// ─── SectionHeader ─────────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '0 4px',
        marginBottom: 10, height: LIST_TOP - 10,
      }}
    >
      <span style={{
        fontFamily: '"DM Mono", monospace', fontSize: 11, fontWeight: 500,
        letterSpacing: '0.06em', color: '#9E9EA6', textTransform: 'uppercase',
      }}>{label}</span>
      {count && (
        <span style={{
          fontFamily: '"DM Mono", monospace', fontSize: 11, color: '#B0B0BC',
        }}>{count}</span>
      )}
    </motion.div>
  )
}

// ─── DeckCard ──────────────────────────────────────────────────────────────────

interface DeckCardProps {
  instance:   CardInstance
  stackIndex: number
  isTop:      boolean
  isFlipped:  boolean
  buttonRef:  React.RefObject<HTMLButtonElement | null>
  onRead:     (id: number | string, item: PostCardData) => void
  onFlip:     (id: number | string) => void
  onCloseFlip: () => void
  renderCard: DeckProps['renderCard']
  renderBack: DeckProps['renderBack']
}

const DeckCard = memo(function DeckCard({
  instance, stackIndex, isTop, isFlipped,
  buttonRef, onRead, onFlip, onCloseFlip,
  renderCard, renderBack,
}: DeckCardProps) {
  const { item } = instance
  const slot     = STACK[stackIndex] ?? STACK[STACK.length - 1]
  const stackRot = stackIndex === 0 ? 0 : seededRot(item.id)

  // ── All MotionValues — never cause React re-renders ──────────────────────
  const dragX   = useMotionValue(0)
  const dragY   = useMotionValue(0)
  const exitX   = useMotionValue(0)
  const exitY   = useMotionValue(0)
  const exitS   = useMotionValue(1)
  const flipY   = useMotionValue(0)

  // Drag rotation: tilt card as it moves horizontally
  const dragRot = useTransform(dragX, [-CARD_W, 0, CARD_W], [-8, 0, 8])

  // Flip faces
  const frontOpacity = useTransform(flipY, [0, 89, 90],   [1, 1, 0])
  const backOpacity  = useTransform(flipY, [89, 90, 180], [0, 1, 1])
  const frontRotateY = useTransform(flipY, v => `${v}deg`)
  const backRotateY  = useTransform(flipY, v => `${v - 180}deg`)

  const isDragging = useRef(false)
  const hasSwiped  = useRef(false)
  const cardRef    = useRef<HTMLDivElement>(null)

  // Expanded dimensions — set when flip opens, cleared on close
  const [expanded, setExpanded] = useState<{ w: number; h: number } | null>(null)

  // Flip animation — purely MotionValue, zero re-renders
  useEffect(() => {
    if (isFlipped) {
      setExpanded(expandedSize())
      animate(flipY, 180, SP_FLIP)
    } else {
      animate(flipY, 0, SP_FLIP)
      // Delay clearing size until flip animation finishes
      setTimeout(() => setExpanded(null), 400)
    }
  }, [isFlipped]) // eslint-disable-line

  function handleTap() {
    if (isDragging.current || !isTop) return
    onFlip(item.id)
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    if (hasSwiped.current) return
    const distOk = Math.abs(info.offset.x) > SWIPE_DIST
    const velOk  = Math.abs(info.velocity.x) > VELOCITY_ESC

    if (distOk || velOk) {
      hasSwiped.current = true
      if (isFlipped) onCloseFlip()

      const buttonEl = buttonRef.current
      if (buttonEl) {
        const cardEl    = cardRef.current
        const cardRect  = cardEl?.getBoundingClientRect()
        const btnRect   = buttonEl.getBoundingClientRect()
        const cardCX    = cardRect ? cardRect.left + cardRect.width  / 2 : window.innerWidth  / 2
        const cardCY    = cardRect ? cardRect.top  + cardRect.height / 2 : window.innerHeight / 2
        const btnCX     = btnRect.left + btnRect.width  / 2
        const btnCY     = btnRect.top  + btnRect.height / 2

        // Phase 1: arc to button
        animate(exitX, btnCX - cardCX, { duration: 0.22, ease: [0.4, 0, 0.2, 1] })
        animate(exitY, btnCY - cardCY, { duration: 0.22, ease: [0.4, 0, 0.2, 1] })
        animate(dragRot as unknown as MotionValue<number>, 0, { duration: 0.15 })

        // Phase 2: shrink into button
        setTimeout(() => {
          animate(exitS, 0, {
            duration: 0.15, ease: 'easeIn',
            onComplete: () => onRead(item.id, item),
          })
        }, 200)
      } else {
        // Fallback: fly off screen
        const dir = info.offset.x >= 0 ? 1 : -1
        animate(exitX, dir * EXIT_X, SP_EXIT)
        animate(dragRot as unknown as MotionValue<number>, dir * 25, {
          ...SP_EXIT,
          onComplete: () => onRead(item.id, item),
        })
      }
    } else {
      // Snap back
      animate(dragX, 0, SP_RETURN)
      animate(dragY, 0, SP_RETURN)
    }
  }

  return (
    <>
    <AnimatePresence>
      {expanded && (
        <motion.div
          key="deck-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCloseFlip}
          style={{
            position:        'fixed',
            inset:           0,
            backgroundColor: 'rgba(10,10,20,0.45)',
            backdropFilter:  'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex:          998,
            cursor:          'pointer',
          }}
        />
      )}
    </AnimatePresence>
    <motion.div
      ref={cardRef}
      layoutId={String(item.id)}
      layout
      initial={{ opacity: 0, scale: 0.88, y: slot.y + 20 }}
      animate={{ opacity: 1, scale: slot.scale, y: slot.y }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
      transition={SP_LAYOUT}
      style={expanded ? {
        // When expanded: break out of container, center in viewport
        position:   'fixed',
        top:        '50%',
        left:       '50%',
        width:      expanded.w,
        height:     expanded.h,
        marginTop:  -(expanded.h / 2),
        marginLeft: -(expanded.w / 2),
        x:          0,
        y:          0,
        scale:      1,
        zIndex:     999,
        borderRadius: 16,
        overflow:   'hidden',
        boxShadow:  '0 24px 64px rgba(0,0,0,0.28)',
        cursor:     'default',
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), height 0.28s cubic-bezier(0.4,0,0.2,1), margin 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s',
      } : {
        position:     'absolute',
        width:        CARD_W,
        height:       CARD_H,
        top:          0,
        left:         0,
        x:            exitX,
        y:            exitY,
        rotate:       isTop ? dragRot : stackRot,
        scale:        exitS,
        zIndex:       MAX_VISIBLE - stackIndex,
        borderRadius: 14,
        overflow:     'hidden',
        boxShadow:    '0 4px 24px rgba(0,0,0,0.10)',
        cursor:       isTop ? 'grab' : 'default',
        pointerEvents: 'auto',
        originX:      '50%',
        originY:      'top',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      dragDirectionLock
      onDrag={(_, info) => { dragX.set(info.offset.x) }}
      onDragStart={() => { isDragging.current = true }}
      onDragEnd={(e, info) => {
        setTimeout(() => { isDragging.current = false }, 50)
        handleDragEnd(e, info)
      }}
    >
      {/* Front face */}
      <motion.div style={{
        position:             'absolute', inset: 0,
        opacity:              frontOpacity,
        rotateY:              frontRotateY,
        transformOrigin:      'center center',
        backfaceVisibility:   'hidden',
        WebkitBackfaceVisibility: 'hidden',
        pointerEvents:        isFlipped ? 'none' : 'auto',
      }}
        onClick={handleTap}
      >
        {renderCard(item, handleTap)}
      </motion.div>

      {/* Back face */}
      <motion.div
        onClick={e => e.stopPropagation()}
        style={{
          position:             'absolute', inset: 0,
          opacity:              backOpacity,
          rotateY:              backRotateY,
          transformOrigin:      'center center',
          backfaceVisibility:   'hidden',
          WebkitBackfaceVisibility: 'hidden',
          pointerEvents:        isFlipped ? 'auto' : 'none',
        }}>
        {renderBack(item, onCloseFlip)}

        {/* Edge drag handles — narrow strips on left/right edges of the back
            face. Wide enough to catch a swipe gesture, narrow enough to not
            cover the back face content/buttons. */}
        {isFlipped && ['left', 'right'].map(side => (
          <motion.div
            key={side}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.85}
            onDrag={(_, info) => { dragX.set(info.offset.x) }}
            onDragStart={() => { isDragging.current = true }}
            onDragEnd={(e, info) => {
              setTimeout(() => { isDragging.current = false }, 50)
              handleDragEnd(e, info)
            }}
            style={{
              position:    'absolute',
              top:         0,
              bottom:      0,
              [side]:      0,
              width:       44,
              background:  'transparent',
              zIndex:      100,
              touchAction: 'none',
              cursor:      'grab',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
    </>
  )
})

// ─── ListRow ───────────────────────────────────────────────────────────────────

interface ListRowProps {
  instance:    CardInstance
  isFlipped:   boolean
  onFlip:      (id: number | string) => void
  onCloseFlip: () => void
  renderBack:  DeckProps['renderBack']
}

const ListRow = memo(function ListRow({
  instance, isFlipped, onFlip, onCloseFlip, renderBack,
}: ListRowProps) {
  const { item } = instance
  const isRead   = instance.status === 'read'

  return (
    <motion.div
      layoutId={isFlipped ? undefined : String(item.id)}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={SP_LAYOUT}
      style={{
        position:        'relative',
        height:          ROW_H,
        borderRadius:    14,
        overflow:        'hidden',
        boxShadow:       isFlipped ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
        backgroundColor: '#fff',
        cursor:          isFlipped ? 'default' : 'pointer',
        opacity:         isFlipped ? 0.35 : 1,
        transition:      'opacity 0.2s, box-shadow 0.2s',
      }}
      onClick={() => { if (!isFlipped) onFlip(item.id) }}
    >
      {/* Collapsed row */}
      <div style={{
        position:   'absolute', inset: 0,
        display:    'flex', alignItems: 'center',
        gap:        12, padding: '0 16px',
        pointerEvents: isFlipped ? 'none' : 'auto',
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          <Image src={item.imageUrl} alt={item.title} width={48} height={48}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily:          '"EB Garamond", Georgia, serif',
            fontSize:            16, fontWeight: 500,
            color:               isRead ? '#9090A8' : '#13131B',
            textDecorationLine:  isRead ? 'line-through' : 'none',
            textDecorationColor: 'rgba(144,144,168,0.5)',
            margin: '0 0 2px', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{item.title}</p>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: 11, color: '#9E9EA6', fontWeight: 500 }}>From:</span>
            <span style={{ fontFamily: '"Caveat", cursive', fontSize: 15, color: '#6E6E7E', lineHeight: 1.1 }}>{item.sender}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          {isRead && instance.readAt && (
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: 10, color: '#C0C0CC' }}>
              {formatTimeAgo(instance.readAt)}
            </span>
          )}
          {item.stampUrl && (
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(111,111,118,0.15)' }}>
              <Image src={item.stampUrl} alt="stamp" width={36} height={36}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </div>
          )}
        </div>
      </div>

    </motion.div>
  )
})