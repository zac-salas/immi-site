'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export interface PostCardData {
  id:         number | string
  imageUrl:   string
  stampUrl?:  string
  title:      string
  sender:     string
  body?:      string
  images?:    string[]
}

interface PostCardBackProps {
  item:      PostCardData
  onClose:   () => void
  onReply?:  () => void
}

export default function PostCardBack({ item, onClose, onReply }: PostCardBackProps) {
  const images = (item.images?.length ? item.images : [item.imageUrl]).slice(0, 5)
  const stackImages = images.slice(0, 2)
  const extraCount  = images.length - 2

  const [lightboxOpen,  setLightboxOpen]  = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const openLightbox = useCallback((i: number) => {
    setLightboxIndex(i)
    setLightboxOpen(true)
  }, [])

  // Prevent Deck's touchmove handler from swallowing button taps
  const handleCloseTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation()
    onClose()
  }, [onClose])

  function formatTimeAgo(date?: Date) {
    if (!date) return ''
    const diff = Date.now() - date.getTime()
    const hrs = Math.floor(diff / 3_600_000)
    if (hrs < 1)  return 'just now'
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <>
      <div style={{
        position:        'absolute',
        inset:           0,
        backgroundColor: '#FAFBFF',
        borderRadius:    16,
        display:         'flex',
        flexDirection:   'column',
        overflow:        'hidden',
        fontFamily:      'inherit',
      }}>
        {/* Dotted border overlay */}
        <div style={{
          position:     'absolute',
          inset:        0,
          borderRadius: 16,
          borderWidth: 1,
          border:       'dotted rgba(111,111,118,0.25)',
          pointerEvents:'none',
          zIndex:       99,
        }} />

        {/* Header */}
        <div style={{
          display:       'flex',
          flexDirection: 'row',
          alignItems:    'flex-start',
          padding:       '16px 16px 0',
          gap:           10,
        }}>
          {/* Close button — touchEnd + onClick both wired to handle iOS tap */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            onTouchEnd={handleCloseTouchEnd}
            style={{
              width:           28,
              height:          28,
              borderRadius:    '50%',
              backgroundColor: 'rgba(19,19,27,0.07)',
              border:          'none',
              cursor:          'pointer',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              flexShrink:      0,
              marginTop:       2,
              fontSize:        13,
              color:           '#13131B',
              fontWeight:      500,
              zIndex:          100,
              position:        'relative',
            }}
          >
            ✕
          </button>

          {/* Title + sender */}
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily:    '"EB Garamond", Georgia, serif',
              fontSize:      22,
              fontWeight:    500,
              letterSpacing: '-0.33px',
              color:         '#13131B',
              margin:        '0 0 2px',
              lineHeight:    1.2,
            }}>
              {item.title}
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <span style={{
                fontFamily:    '"DM Mono", monospace',
                color:         '#6F6F76',
                fontSize:      12,
                letterSpacing: '-0.33px',
                fontWeight:    500,
              }}>
                From:
              </span>
              <span style={{
                fontFamily:    '"Caveat", cursive',
                color:         '#414149',
                fontSize:      18,
                letterSpacing: '-0.33px',
                lineHeight:    1.2,
              }}>
                {item.sender}
              </span>
            </div>
          </div>

          {/* Stamp */}
          {item.stampUrl && (
            <div style={{
              width:        64,
              height:       64,
              flexShrink:   0,
              borderRadius: 4,
              overflow:     'hidden',
            }}>
              <Image
                src={item.stampUrl}
                alt="stamp"
                width={52}
                height={60}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{
          height:          1,
          backgroundColor: 'rgba(111,111,118,0.17)',
          margin:          '10px 20px 0',
        }} />

        {/* Scrollable body */}
        <div
          ref={scrollRef}
          style={{
            flex:               1,
            overflowY:          'auto',
            padding:            '14px 20px 8px',
            scrollbarWidth:     'none',
            touchAction:        'pan-y',
            overscrollBehavior: 'contain',
          }}
        >
          <p style={{
            fontFamily:       '"DM Sans", sans-serif',
            fontSize:         16,
            lineHeight:       1.625,
            color:            '#13131B',
            letterSpacing:    '-0.1px',
            margin:           0,
            whiteSpace:       'pre-wrap',
            userSelect:       'text',
            WebkitUserSelect: 'text',
          }}>
            {item.body ?? 'Pass a `body` field in your PostCardData to show content here.'}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display:        'flex',
          flexDirection:  'row',
          alignItems:     'flex-end',
          justifyContent: 'space-between',
          padding:        '12px 20px 24px',
        }}>
          {/* Image thumbnail(s) */}
          {images.length === 1 ? (
            <button
              onClick={() => openLightbox(0)}
              style={{
                width:        60,
                height:       60,
                borderRadius: 6,
                overflow:     'hidden',
                border:       '2px solid #fff',
                boxShadow:    '0 2px 8px rgba(0,0,0,0.15)',
                cursor:       'pointer',
                padding:      0,
                background:   'none',
                flexShrink:   0,
              }}
            >
              <Image
                src={images[0]}
                alt="photo"
                width={60}
                height={60}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </button>
          ) : (
            <button
              onClick={() => openLightbox(0)}
              style={{
                position:   'relative',
                width:       78,
                height:      70,
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                padding:    0,
                flexShrink: 0,
              }}
            >
              {stackImages.map((src, i) => (
                <div
                  key={i}
                  style={{
                    position:     'absolute',
                    width:         60,
                    height:        60,
                    borderRadius:  6,
                    overflow:      'hidden',
                    border:        '2px solid #fff',
                    boxShadow:     '0 2px 8px rgba(0,0,0,0.15)',
                    left:          i * 14,
                    zIndex:        i,
                    transform:     `rotate(${i === 0 ? -5 : 3}deg)`,
                    top:           0,
                  }}
                >
                  <Image
                    src={src}
                    alt="photo"
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </div>
              ))}
              {extraCount > 0 && (
                <div style={{
                  position:        'absolute',
                  top:             -6,
                  right:           -6,
                  backgroundColor: '#3D52D5',
                  borderRadius:    10,
                  minWidth:        20,
                  height:          20,
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  padding:         '0 4px',
                  zIndex:          10,
                }}>
                  <span style={{
                    color:         '#fff',
                    fontSize:      10,
                    fontFamily:    '"DM Sans", sans-serif',
                    fontWeight:    600,
                    letterSpacing: '-0.2px',
                  }}>
                    +{extraCount}
                  </span>
                </div>
              )}
            </button>
          )}

          {/* Reply button */}
          <button
            onClick={onReply}
            style={{
              backgroundColor: '#585BBB',
              color:           '#fff',
              border:          'none',
              borderRadius:    12,
              padding:         '12px 22px',
              cursor:          'pointer',
              display:         'flex',
              alignItems:      'center',
              gap:             8,
              fontFamily:      '"DM Sans", sans-serif',
              fontSize:        15,
              fontWeight:      600,
              letterSpacing:   '-0.2px',
            }}
          >
            Reply <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position:        'fixed',
            inset:           0,
            backgroundColor: 'rgba(0,0,0,0.94)',
            zIndex:          9999,
            display:         'flex',
            flexDirection:   'column',
            alignItems:      'center',
            justifyContent:  'center',
            cursor:          'zoom-out',
          }}
        >
          <div style={{
            position: 'relative',
            width:    '90vw',
            maxWidth: 680,
            height:   '70vh',
          }}>
            <Image
              src={images[lightboxIndex]}
              alt="photo"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => Math.max(0, i - 1)) }}
                style={{ position: 'fixed', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: 20, cursor: 'pointer' }}
              >‹</button>
              <button
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => Math.min(images.length - 1, i + 1)) }}
                style={{ position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: 20, cursor: 'pointer' }}
              >›</button>
              <div style={{ display: 'flex', gap: 6, marginTop: 24 }}>
                {images.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width:           i === lightboxIndex ? 18 : 6,
                      height:          6,
                      borderRadius:    3,
                      backgroundColor: i === lightboxIndex ? '#fff' : 'rgba(255,255,255,0.35)',
                      transition:      'width 0.2s',
                    }}
                  />
                ))}
              </div>
            </>
          )}

          <p style={{
            position:      'absolute',
            bottom:        40,
            color:         'rgba(255,255,255,0.4)',
            fontSize:      13,
            fontStyle:     'italic',
            letterSpacing: '0.5px',
            userSelect:    'none',
          }}>
            tap to close
          </p>
        </div>
      )}
    </>
  )
}