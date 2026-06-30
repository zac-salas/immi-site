'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

export interface PostCardData {
  id:        number | string
  imageUrl:  string
  stampUrl?: string
  title:     string
  sender:    string
  body?:     string
}

export interface ReadCardEntry {
  item:    PostCardData
  readAt?: Date
}

interface PostCardListProps {
  unreadCount: number
  readCards:   ReadCardEntry[]
  onCardClick: (item: PostCardData) => void
}

function formatTimeAgo(date?: Date): string {
  if (!date) return ''
  const diff = Date.now() - date.getTime()
  const hrs  = Math.floor(diff / 3_600_000)
  if (hrs < 1)  return 'just now'
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function PostCardList({ unreadCount, readCards, onCardClick }: PostCardListProps) {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => { setIsMounted(true) }, [])
  if (!isMounted) return null

  return (
    <div style={{
      width:     340,
      maxHeight: '80vh',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      fontFamily: 'inherit',
    }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   8,
        padding:        '0 4px',
      }}>
        <SectionLabel text="Unread" />
        <span style={{
          fontFamily:    '"DM Mono", monospace',
          fontSize:      12,
          color:         '#6F6F76',
          letterSpacing: '-0.2px',
        }}>
          {unreadCount} new post{unreadCount !== 1 ? 's' : ''}
        </span>
      </div>

      {unreadCount === 0 && (
        <div style={{
          padding:    '12px 4px 20px',
          color:      '#9E9EA6',
          fontSize:   13,
          fontStyle:  'italic',
          fontFamily: '"DM Sans", sans-serif',
        }}>
          All caught up.
        </div>
      )}

      {/* ── Read section ────────────────────────────────────────────────────── */}
      {readCards.length > 0 && (
        <>
          <SectionLabel text="Read" style={{ marginTop: 12, marginBottom: 8 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {readCards.map(({ item, readAt }) => (
              <CardRow
                key={item.id}
                item={item}
                readAt={readAt}
                onClick={() => onCardClick(item)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SectionLabel({ text, style }: { text: string; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontFamily:    '"DM Mono", monospace',
      fontSize:      11,
      fontWeight:    500,
      letterSpacing: '0.06em',
      color:         '#9E9EA6',
      textTransform: 'uppercase',
      margin:        0,
      padding:       '0 4px',
      ...style,
    }}>
      {text}
    </p>
  )
}

function CardRow({ item, readAt, onClick }: { item: PostCardData; readAt?: Date; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width:           '100%',
        display:         'flex',
        flexDirection:   'row',
        alignItems:      'center',
        justifyContent:  'space-between',
        padding:         '14px 16px',
        backgroundColor: '#fff',
        borderRadius:    14,
        border:          'none',
        cursor:          'pointer',
        boxShadow:       '0 2px 12px rgba(0,0,0,0.06)',
        textAlign:       'left',
        gap:             12,
        transition:      'transform 0.12s, box-shadow 0.12s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily:          '"EB Garamond", Georgia, serif',
          fontSize:            17,
          fontWeight:          500,
          letterSpacing:       '-0.3px',
          color:               '#9090A8',
          textDecoration:      'line-through',
          textDecorationColor: 'rgba(144,144,168,0.6)',
          margin:              '0 0 3px',
          whiteSpace:          'nowrap',
          overflow:            'hidden',
          textOverflow:        'ellipsis',
        }}>
          {item.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          <span style={{
            fontFamily:    '"DM Mono", monospace',
            color:         '#9E9EA6',
            fontSize:      11,
            fontWeight:    500,
          }}>
            From:
          </span>
          <span style={{
            fontFamily: '"Caveat", cursive',
            color:      '#6E6E7E',
            fontSize:   16,
            lineHeight: 1.1,
          }}>
            {item.sender}
          </span>
        </div>
      </div>

      <span style={{
        fontFamily:  '"DM Mono", monospace',
        fontSize:    11,
        color:       '#B0B0BC',
        flexShrink:  0,
        whiteSpace:  'nowrap',
      }}>
        {formatTimeAgo(readAt)}
      </span>

      {item.stampUrl && (
        <div style={{
          width:        44,
          height:       44,
          borderRadius: '50%',
          overflow:     'hidden',
          flexShrink:   0,
          border:       '1.5px solid rgba(111,111,118,0.15)',
        }}>
          <Image
            src={item.stampUrl}
            alt="stamp"
            width={44}
            height={44}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
      )}
    </button>
  )}