import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

const MAX_SIZE = 8 * 1024 * 1024 // 8MB

const SIGNATURES: { ext: string; mime: string; check: (b: Buffer) => boolean }[] = [
  { ext: 'jpg',  mime: 'image/jpeg', check: b => b[0] === 0xff && b[1] === 0xd8 },
  { ext: 'png',  mime: 'image/png',  check: b => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: 'webp', mime: 'image/webp', check: b => b.slice(0, 4).toString('ascii') === 'RIFF' && b.slice(8, 12).toString('ascii') === 'WEBP' },
]

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'Image is too large — keep it under 8MB.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const match = SIGNATURES.find(sig => sig.check(buffer))
    if (!match) {
      return Response.json(
        { error: 'Unsupported file type — please upload a JPEG, PNG, or WebP image.' },
        { status: 400 }
      )
    }

    const path = `${crypto.randomUUID()}.${match.ext}`

    const { error: uploadError } = await supabase
      .storage
      .from('postcard-images')
      .upload(path, buffer, { contentType: match.mime })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return Response.json({ error: 'Upload failed — try a different image.' }, { status: 500 })
    }

    const { data } = supabase.storage.from('postcard-images').getPublicUrl(path)

    return Response.json({ imageUrl: data.publicUrl })
  } catch (err) {
    console.error('Upload route error:', err)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}