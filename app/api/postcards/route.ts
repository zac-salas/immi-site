import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export const runtime = 'nodejs'

const DEFAULT_STAMP_URL = '/images/Default Stamp.png'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { imageUrl, message, senderName, recipientName, stampUrl } = body

    // Validation — stampUrl intentionally excluded; it's optional with a
    // fallback below. Everything else is required.
    if (
      !imageUrl ||
      !message?.trim() ||
      !senderName?.trim() ||
      !recipientName?.trim()
    ) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (message.length > 1000) {
      return Response.json(
        { error: 'Message is too long' },
        { status: 400 }
      )
    }

    const id = nanoid(8)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const { error } = await supabase.from('postcards').insert({
      id,
      image_url: imageUrl,
      message: message.trim(),
      sender_name: senderName.trim(),
      recipient_name: recipientName.trim(),
      stamp_url: stampUrl || DEFAULT_STAMP_URL, // optional, falls back here
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return Response.json(
        { error: 'Failed to create postcard' },
        { status: 500 }
      )
    }

    const origin = new URL(req.url).origin

    return Response.json({
      id,
      url: `${origin}/cards/${id}`,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (err) {
    console.error('Create postcard error:', err)
    return Response.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}