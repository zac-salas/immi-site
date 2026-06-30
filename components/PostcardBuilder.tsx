'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useIsMobile } from '@/components/PostCard/Shared'
import type { Page } from '@/components/PostCard/Shared'
import CardView from '@/app/cards/[id]/CardView'
import type { PostcardRow } from '@/lib/supabase'

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

const TITLE_MAX = 40

type Step = 'template' | 'write' | 'share'

const STEP_COPY: Record<Step, { title: string; subtitle: string }> = {
  template: { title: 'Pick a Photo',         subtitle: 'this is the front of your card.' },
  write:    { title: 'Write Your Message',   subtitle: 'this will live on the back of the card.' },
  share:    { title: 'Your Postcard is Ready', subtitle: "save this link — it won't be sent to you again." },
}

export default function PostcardBuilder({ setPage }: { setPage?: (p: Page) => void }) {
  const mobile = useIsMobile()
  const [step, setStep] = useState<Step>('template')

  const [imageUrl, setImageUrl]   = useState(TEMPLATES[0].url)
  const [stampUrl, setStampUrl]   = useState(STAMPS[0].url)
  const [message, setMessage]     = useState('')
  const [senderName, setSenderName]     = useState('')
  const [recipientName, setRecipientName] = useState('')

  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [createdCard, setCreatedCard] = useState<PostcardRow | null>(null)

  const STEPS: Step[] = ['template', 'write', 'share']
  const stepIndex = STEPS.indexOf(step)

  async function handleFileUpload(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      setError('Image is too large — keep it under 8MB.')
      return
    }
    setError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/postcards/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setImageUrl(data.imageUrl)
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

  // Step 3 bypasses the wizard chrome entirely — full-bleed CardView,
  // identical to what the recipient will see, with a dismissible
  // owner-only copy-link overlay layered on top.
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

      {/* Heading + subtitle — sits outside the white card, consistent
          across all three steps, content driven by the active step */}
      <h3 style={{ ...labelHeading, marginBottom: 4 }}>{copy.title}</h3>
      <p style={{ ...helperText, marginBottom: 20 }}>{copy.subtitle}</p>

      <div style={{
        background:   '#FAFBFF',
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
              <div style={{
                position: 'absolute', bottom: 10, right: 10,
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(15,15,20,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}>
                {uploading ? (
                  <span style={{ fontSize: 10, color: '#FCFCFF' }}>...</span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FCFCFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <button onClick={() => setPage?.('home')} style={iconBackBtn} aria-label="Back to home">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
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
            <label style={fieldLabel}>Message (required)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Was thinking about you today..."
              maxLength={1000}
              rows={5}
              style={textareaStyle}
            />

            <label style={fieldLabel}>Title (required)</label>
            <input
              value={recipientName}
              onChange={e => setRecipientName(e.target.value.slice(0, TITLE_MAX))}
              placeholder="Give your card a title"
              maxLength={TITLE_MAX}
              style={{ ...inputStyle, borderRadius: 8 }}
            />
            <p style={charCount}>{recipientName.length}/{TITLE_MAX}</p>

            <label style={fieldLabel}>Your name (required)</label>
            <input
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              placeholder="Your name"
              style={{ ...inputStyle, borderRadius: 8 }}
            />

            <label style={fieldLabel}>Stamp</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                position: 'relative', overflow: 'hidden',
                border: '1px solid rgba(43,44,73,0.1)',
              }}>
                <Image src={stampUrl} alt="" fill style={{ objectFit: 'cover' }} />
              </div>
              <select
                value={stampUrl}
                onChange={e => setStampUrl(e.target.value)}
                style={{ ...inputStyle, borderRadius: 8, marginBottom: 0, flex: 1, cursor: 'pointer' }}
              >
                {STAMPS.map(s => (
                  <option key={s.url} value={s.url}>{s.label}</option>
                ))}
              </select>
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
  )
}

// ─── Step dots ───────────────────────────────────────────────────────────────

function StepDots({ stepIndex }: { stepIndex: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: i === stepIndex ? 8 : 6,
          height: i === stepIndex ? 8 : 6,
          borderRadius: '50%',
          background: i === stepIndex ? '#7f83e8' : 'rgba(127,131,232,0.25)',
          transition: 'all 0.2s',
        }} />
      ))}
    </div>
  )
}

// ─── Style tokens ────────────────────────────────────────────────────────────

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
  fontWeight: 700, fontSize: 14, color: '#0f0f14',
  marginBottom: 6, marginTop: 14,
  fontFamily: '"DM Sans", sans-serif',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 14,
  border: 'none',
  background: '#EDEEF8',
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
  borderRadius: 100,
  padding: '15px 0',
  fontSize: 16,
  fontWeight: 700,
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