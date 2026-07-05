'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useIsMobile } from '@/components/PostCard/Shared'

import CardView from '@/app/cards/[id]/CardView'
import type { PostcardRow } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

const TEMPLATES = [
  { id: 'cafe',    url: '/images/cafecard.png',    label: 'café' },
  { id: 'doodle',  url: '/images/doodlecard.png',  label: 'doodle' },
  { id: 'yunque',  url: '/images/yunquecard.png',  label: 'nature' },
  { id: 'phantom', url: '/images/phantomcard.png', label: 'music' },
  { id: 'bbq',     url: '/images/bbqcard.png',     label: 'food' },
]

const STAMPS = [
  { url: '/images/Default Stamp.png',       label: 'immi' },
  { url: '/images/Casual Stamp.png',        label: 'casual' },
  { url: '/images/Art Stamp.png',           label: 'art' },
  { url: '/images/Travel Stamp.png',        label: 'travel' },
  { url: '/images/Food Stamp.png',          label: 'food' },
  { url: '/images/Nature Stamp.png',        label: 'nature' },
  { url: '/images/Entertainment Stamp.png', label: 'fun' },
  { url: '/images/Work Stamp.png',          label: 'work' },
]

const TITLE_MAX = 30

type Step = 'template' | 'write' | 'share'

const STEP_COPY: Record<Step, { title: string; subtitle: string }> = {
  template: { title: 'Pick a Photo',          subtitle: 'this is the front of your card.' },
  write:    { title: 'Write Your Message',    subtitle: 'this will live on the back of the card.' },
  share:    { title: 'Your Postcard is Ready', subtitle: "save this link — it won't be sent to you again." },
}

export default function PostcardBuilder({ setPage }: { setPage?: (p: string) => void }) {
  const mobile = useIsMobile()
  const [step, setStep] = useState<Step>('template')

  const [imageUrl, setImageUrl]           = useState(TEMPLATES[0].url)
  const [stampUrl, setStampUrl]           = useState(STAMPS[0].url)
  const [message, setMessage]             = useState('')
  const [senderName, setSenderName]       = useState('')
  const [recipientName, setRecipientName] = useState('')

  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stampScrollRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({ down: false, startX: 0, startScroll: 0, moved: false, pendingDx: 0, rafId: 0 })

  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [shareUrl, setShareUrl]       = useState<string | null>(null)
  const [createdCard, setCreatedCard] = useState<PostcardRow | null>(null)

  const STEPS: Step[] = ['template', 'write', 'share']
  const stepIndex = STEPS.indexOf(step)

  // Desktop has no touch-swipe, so a bare overflow-x:auto row is stuck
  // unless someone knows to hold shift while scrolling. These make it
  // behave like a normal horizontal carousel for mouse/trackpad users.
  function handleStampWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.currentTarget.scrollLeft += e.deltaY
    }
  }

  function handleStampPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = stampScrollRef.current
    if (!el) return

    dragState.current = {
      down: true, startX: e.clientX, startScroll: el.scrollLeft,
      moved: false, pendingDx: 0, rafId: 0,
    }
    // Scroll-snap fights a manual scrollLeft drag — the browser keeps
    // pulling toward the nearest snap point mid-drag, which is what read
    // as "teleporting." Snapping should only kick in once you let go.
    el.style.scrollSnapType = 'none'

    // Deliberately NOT using setPointerCapture here: capturing the pointer
    // to the container retargets the eventual click to the container
    // itself instead of whichever stamp button is under the finger/cursor,
    // so individual stamp buttons stop being selectable. Tracking the drag
    // via window listeners instead leaves normal click targeting intact.
    function onMove(ev: PointerEvent) {
      const state = dragState.current
      if (!state.down) return
      const dx = ev.clientX - state.startX
      if (Math.abs(dx) > 4) state.moved = true
      state.pendingDx = dx
      if (!state.rafId) {
        state.rafId = requestAnimationFrame(() => {
          el!.scrollLeft = state.startScroll - state.pendingDx
          state.rafId = 0
        })
      }
    }

    function onUp() {
      const state = dragState.current
      if (state.rafId) {
        cancelAnimationFrame(state.rafId)
        state.rafId = 0
      }
      state.down = false
      el!.style.scrollSnapType = 'x proximity'
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  // Suppress the stamp-select click if the pointer-down turned into a drag,
  // so dragging the strip doesn't also fire a selection on release.
  function handleStampClickCapture(e: React.MouseEvent) {
    if (dragState.current.moved) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  async function handleFileUpload(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      setError('Image is too large — keep it under 8MB.')
      return
    }

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED.includes(file.type)) {
      setError('Unsupported file type — please upload a JPEG, PNG, or WebP image.')
      return
    }

    setError(null)
    setUploading(true)
    try {
      const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
      const path = `${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase
        .storage
        .from('postcard-images')
        .upload(path, file, { contentType: file.type })

      if (uploadError) throw new Error('Upload failed — try a different image.')

      const { data } = supabase.storage.from('postcard-images').getPublicUrl(path)
      setImageUrl(data.publicUrl)
    } catch (e: any) {
      setError(e.message || 'Upload failed — try a different image.')
    } finally {
      setUploading(false)
    }
  }

  async function handleGenerate() {
    if (!message.trim() || !senderName.trim() || !recipientName.trim()) {
      setError('Add a message, your name, and their name first.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/postcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl, stampUrl, message, senderName, recipientName,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      setShareUrl(data.url)
      setCreatedCard({
        id: data.id,
        image_url: imageUrl,
        message: message.trim(),
        sender_name: senderName.trim(),
        recipient_name: recipientName.trim(),
        stamp_url: stampUrl,
        created_at: new Date().toISOString(),
        expires_at: data.expiresAt,
      })
      setStep('share')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const copy = STEP_COPY[step]

  if (step === 'share' && createdCard && shareUrl) {
    return (
      <CardView
        card={createdCard}
        shareUrl={shareUrl}
        onMakeAnother={() => {
          setStep('template')
          setMessage('')
          setSenderName('')
          setRecipientName('')
          setShareUrl(null)
          setCreatedCard(null)
        }}
      />
    )
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .immi-field::placeholder {
          color: #6b6b78;
          opacity: 1;
        }
        .immi-scroll-x {
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          user-select: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .immi-scroll-x::-webkit-scrollbar {
          display: none;
        }
        .immi-scroll-x * {
          -webkit-user-drag: none;
        }
      `}</style>

      <div style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 88,
        paddingBottom: 24,
        paddingLeft: 16,
        paddingRight: 16,
        boxSizing: 'border-box',
      }}>

        <h3 style={{ ...labelHeading, marginBottom: 4 }}>{copy.title}</h3>
        <p style={{ ...helperText, marginBottom: 32, lineHeight: .3 }}>{copy.subtitle}</p>

        <div style={{
          background:   '#F5F5FC',
          borderRadius: 16,
          padding:      mobile ? '28px 24px' : '32px 36px',
          maxWidth:     430,
          width:        '100%',
          margin:       '0 auto',
          boxShadow:    '0 20px 60px rgba(43,44,73,0.14), 0 4px 16px rgba(43,44,73,0.08)',
        }}>

          {/* STEP 1 — Pick a photo */}
          {step === 'template' && (
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  marginBottom: 16,
                  background: '#EEEEF5',
                  boxShadow: '0 2px 8px rgba(43,44,73,0.12), inset 0 0 0 1px rgba(43,44,73,0.06)',
                }}
              >
                <Image src={imageUrl} alt="postcard photo preview" fill style={{ objectFit: 'cover' }} />

                {/* Shimmer sweep — visible only while an upload is in progress */}
                {uploading && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.2s ease-in-out infinite',
                  }} />
                )}

                <div style={{
                  position: 'absolute', bottom: 10, right: 10,
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.1)',
                }}>
                  {uploading ? (
                    <span style={{ fontSize: 10, color: '#FCFCFF' }}>...</span>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  )}
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                style={{ display: 'none' }}
              />

              <p style={{ fontSize: 13, color: '#6F6F76', textAlign: 'left', margin: '0 0 8px', fontFamily: '"DM Sans", sans-serif' }}>
                or choose a template
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 6,
                marginBottom: 24,
              }}>
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setImageUrl(t.url)}
                    title={t.label}
                    aria-label={`Use ${t.label} template`}
                    aria-pressed={imageUrl === t.url}
                    style={{
                      position: 'relative',
                      border: imageUrl === t.url ? '2px solid #7f83e8' : '2px solid transparent',
                      borderRadius: 8,
                      overflow: 'hidden',
                      padding: 0,
                      cursor: 'pointer',
                      aspectRatio: '1',
                    }}
                  >
                    <Image src={t.url} alt={t.label} fill style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>

              {error && <p style={errorText}>{error}</p>}

              <div style={{ display: 'flex', gap: 10 }}>
                {/* <button onClick={() => setPage?.('home')} style={iconBackBtn} aria-label="Back to home">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button> */}
                <button onClick={() => setStep('write')} disabled={uploading} style={{ ...primaryBtn, flex: 1 }}>
                  {uploading ? 'Uploading...' : 'Continue'}
                </button>
              </div>

              <StepDots stepIndex={stepIndex} />
            </div>
          )}

          {/* STEP 2 — Write message + pick stamp */}
          {step === 'write' && (
            <div>
              <label style={fieldLabel}>Message <span style={requiredTag}>(required)</span></label>
              <textarea
                className="immi-field"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Was thinking about you today..."
                rows={5}
                style={textareaStyle}
              />
              <p style={charCount}>{message.length}/∞</p>

              <label style={fieldLabel}>Title <span style={requiredTag}>(required)</span></label>
              <input
                className="immi-field"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value.slice(0, TITLE_MAX))}
                placeholder="Give your card a title"
                maxLength={TITLE_MAX}
                style={{ ...inputStyle, borderRadius: 8 }}
              />
              <p style={charCount}>{recipientName.length}/{TITLE_MAX}</p>

              <label style={fieldLabel}>Your name <span style={requiredTag}>(required)</span></label>
              <input
                className="immi-field"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                placeholder="Your name"
                style={{ ...inputStyle, borderRadius: 8 }}
              />

              <label style={fieldLabel}>Stamp</label>
              <div style={{
                position: 'relative',
                marginBottom: 4,
              }}>
                <div
                  ref={stampScrollRef}
                  className="immi-scroll-x"
                  onWheel={handleStampWheel}
                  onPointerDown={handleStampPointerDown}
                  onClickCapture={handleStampClickCapture}
                  style={{
                    display: 'flex',
                    gap: 12,
                    overflowX: 'auto',
                    paddingBottom: 6,
                    paddingRight: 16,
                    scrollSnapType: 'x proximity',
                    cursor: 'grab',
                    touchAction: 'pan-x',
                  }}
                >
                  {STAMPS.map(s => {
                    const selected = stampUrl === s.url
                    return (
                      <button
                        key={s.url}
                        onClick={() => setStampUrl(s.url)}
                        title={s.label}
                        aria-label={`Use ${s.label} stamp`}
                        aria-pressed={selected}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          flexShrink: 0,
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          width: 52,
                          scrollSnapAlign: 'start',
                          paddingTop: 4,
                        }}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          position: 'relative', overflow: 'hidden',
                          boxShadow: selected
                            ? '0 0 0 2px #7f83e8, 0 2px 6px rgba(43,44,73,0.15)'
                            : '0 0 0 1px rgba(43,44,73,0.1)',
                          transition: 'box-shadow 0.15s',
                        }}>
                          <Image src={s.url} alt={s.label} fill style={{ objectFit: 'cover' }} draggable={false} />
                        </div>
                        <span style={{
                          fontSize: 11,
                          color: selected ? '#7f83e8' : '#6F6F76',
                          fontWeight: selected ? 700 : 400,
                          fontFamily: '"DM Sans", sans-serif',
                          whiteSpace: 'nowrap',
                        }}>
                          {s.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {/* Fade hints there's more to scroll, without a visible track/scrollbar */}
                <div style={{
                  position: 'absolute', top: 0, right: 0, bottom: 6, width: 28,
                  background: 'linear-gradient(to right, transparent, #F5F5FC)',
                  pointerEvents: 'none',
                }} />
              </div>
              <p style={{ marginBottom: 20 }} />

              {error && <p style={errorText}>{error}</p>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('template')} style={iconBackBtn} aria-label="Back">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <button onClick={handleGenerate} disabled={loading} style={{ ...primaryBtn, flex: 1 }}>
                  {loading ? 'Creating...' : 'Create postcard'}
                </button>
              </div>

              <StepDots stepIndex={stepIndex} />
            </div>
          )}

        </div>
      </div>
    </>
  )
}

// ─── Step dots ────────────────────────────────────────────────────────────────

function StepDots({ stepIndex }: { stepIndex: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width:  i === stepIndex ? 8 : 6,
          height: i === stepIndex ? 8 : 6,
          borderRadius: '50%',
          background: i === stepIndex ? '#7f83e8' : 'rgba(127,131,232,0.25)',
          transition: 'all 0.2s',
        }} />
      ))}
    </div>
  )
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

const labelHeading: React.CSSProperties = {
  fontWeight: 600, fontSize: 28, color: '#0f0f14',
  textAlign: 'center',
  fontFamily: '"DM Sans", sans-serif',
}

const helperText: React.CSSProperties = {
  fontSize: 15, color: '#6F6F76', textAlign: 'center',
  fontFamily: '"DM Sans", sans-serif',
}

const errorText: React.CSSProperties = {
  color: '#c0392b', fontSize: 13, marginBottom: 12, textAlign: 'center',
  fontFamily: '"DM Sans", sans-serif',
}

const charCount: React.CSSProperties = {
  fontSize: 11, color: '#9494a0', textAlign: 'right',
  margin: '2px 0 0', fontFamily: '"DM Sans", sans-serif',
}

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontWeight: 700, fontSize: 14, color: '#0f0f14bd',
  marginBottom: 6, marginTop: 14,
  fontFamily: '"DM Sans", sans-serif',
}

const requiredTag: React.CSSProperties = {
  fontWeight: 400, fontSize: 11, opacity: 0.45,
  fontFamily: '"DM Sans", sans-serif',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 14,
  border: '.5px solid #E0E0FF',
  background: '#FAFBFF',
  fontSize: 15,
  fontFamily: '"DM Sans", sans-serif',
  color: '#2b2c49',
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: 4,
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  borderRadius: 8,
  resize: 'vertical',
  lineHeight: 1.5,
}

const primaryBtn: React.CSSProperties = {
  width: '100%',
  background: '#7f83e8',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '12px 0',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: '"DM Sans", sans-serif',
}

const secondaryBtn: React.CSSProperties = {
  background: 'transparent',
  color: '#7f83e8',
  border: '1.5px solid #7f83e8',
  borderRadius: 100,
  padding: '15px 20px',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: '"DM Sans", sans-serif',
}

const iconBackBtn: React.CSSProperties = {
  width: 52, height: 52, flexShrink: 0,
  background: 'transparent',
  color: '#7f83e8',
  border: '1.5px solid #7f83e8',
  borderRadius: 8,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
}

const copyBtnStyle: React.CSSProperties = {
  background: '#2b2c49',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '9px 18px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  flexShrink: 0,
  fontFamily: '"DM Sans", sans-serif',
}