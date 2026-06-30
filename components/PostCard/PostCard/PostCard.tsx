'use client'

import cardstyles from "./postcard.module.css"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from 'react'

interface PostCardProps {
  imageUrl:   string
  stampUrl:   string
  title:      string
  sender:     string
  rotation?:  number   // optional — Deck owns positioning now
  scale?:     number
  zIndex?:    number
  top?:       number
  onClick?:   () => void
}

export default function PostCard({
  imageUrl,
  stampUrl,
  title,
  sender,
  rotation = 0,
  scale    = 1,
  zIndex   = 0,
  top      = 0,
  onClick,
}: PostCardProps) {

  const [stampRotation, setStampRotation] = useState(0)
  useEffect(() => {
    setStampRotation((Math.random() * 8) - 4)
  }, [])

  return (
    <div
      className={cardstyles.card}
      onClick={onClick}
      style={{
        position:  'absolute',
        transform: `rotate(${rotation}deg) scale(${scale})`,
        zIndex:    zIndex,
        top:       `${top}px`,
      }}
    >
      <div className={cardstyles.cardTop}>
        <Image
          className={cardstyles.pic}
          src={imageUrl}
          alt={title}
          width={329}
          height={321}
        />
      </div>

      <div className={cardstyles.stampTitle}>
        <div className={cardstyles.copy}>
          <p className={cardstyles.title}>{title}</p>
          <div className={cardstyles.fromLine}>
            <p className={cardstyles.from}>From:</p>
            <p className={cardstyles.name}>{sender}</p>
          </div>
        </div>
        <Image
          className={cardstyles.stamp}
          src={stampUrl}
          alt="stamp"
          width={64}
          height={64}
          style={{ transform: `rotate(${stampRotation}deg)` }}
        />
      </div>

      <div>
        <div className={cardstyles.tap}>
          <p>tap to read</p>
          <ArrowRight className={cardstyles.arrow} />
        </div>
      </div>
    </div>
  )
}