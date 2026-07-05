import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import CardView from './CardView'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CardPage({ params }: Props) {
  const { id } = await params

  const { data, error } = await supabase
    .from('postcards')
    .select('*')
    .eq('id', id)
    .single()

  // Not found, or expired — show the expired state rather than a generic 404
  const isExpired = data && new Date(data.expires_at) < new Date()

  if (error || !data || isExpired) {
    return <ExpiredCard />
  }

  return <CardView card={data} />
}

function ExpiredCard() {
  return (
    <div style={{
      minHeight:  '100vh',
      display:    'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0f14',
      padding:    24,
      textAlign:  'center',
    }}>
      <p style={{
        fontFamily:    'Georgia, serif',
        fontSize:      'clamp(24px, 4vw, 32px)',
        color:         '#FCFCFF',
        maxWidth:      420,
        lineHeight:    1.4,
        marginBottom:  24,
      }}>
        This postcard has faded.
        <br />
        <span style={{ opacity: 0.5, fontSize: '0.8em' }}>
          Some things are meant to be fleeting.
        </span>
      </p>
      <a
        href="https://immi.community/create"
        style={{
          background:    '#7f83e8',
          color:         '#ffffff',
          padding:       '12px 28px',
          borderRadius:  100,
          textDecoration: 'none',
          fontFamily:    'Arial, sans-serif',
          fontWeight:    600,
          fontSize:      14,
        }}
      >
        Keep these postcards forever — get the immi app
      </a>
    </div>
  )
}