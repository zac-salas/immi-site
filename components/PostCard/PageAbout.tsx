'use client'

import { useIsMobile, Footer } from '@/components/PostCard/Shared'

// ─── Page: About ───────────────────────────────────────────────────────────────

export default function PageAbout() {
  const mobile = useIsMobile()

  const team = [
    { initial: 'J', gradient: 'linear-gradient(135deg, #7f83e8, #2b2c49)', name: 'Jonathan Cohen', role: 'Founder',   bio: "Fitness nut, travel enthusiast, techie. Wrote the initial plan for immi at 2 AM in a hotel." },
    { initial: 'A', gradient: 'linear-gradient(135deg, #5ce8b5, #7f83e8)', name: 'Amadou Sow',    role: 'Growth',    bio: "Petrolhead, foodie, retired D3 runner. Has family in 4 countries over 3 different continents." },
    { initial: 'S', gradient: 'linear-gradient(135deg, #c5c5ff, #7f83e8)', name: 'Surya Mani',    role: 'Developer', bio: "The less said, the better." },
    { initial: 'Z', gradient: 'linear-gradient(45deg, #c4c6fc, #7f83e8)',  name: 'Zac Salas',     role: 'Design',    bio: "We'll add something here when Zac eventually figures out who he is." },
  ]

  return (
    <div style={{ paddingTop: 80 }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: mobile ? '48px 28px 40px' : '80px 80px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '-0.04em', color: '#7f83e8', textTransform: 'uppercase', marginBottom: 16 }}>about us</p>
        <h1 style={{
          fontWeight: 500,
          fontSize: mobile ? 34 : 'clamp(34px,4vw,52px)',
          letterSpacing: '-0.03em', lineHeight: 1.1,
          color: '#0f0f14', marginBottom: 16, maxWidth: 640,
        }}>
          a small team building something they actually believe in.
        </h1>
        <p style={{ fontWeight: 300, fontSize: mobile ? 16 : 17, lineHeight: 1.65, color: '#6F6F76', maxWidth: 520, margin: 0 }}>
          immi is entirely self-funded by a group of friends who are tired of what social media has become.
        </p>
      </div>

      {/* ── Why We Built Immi ─────────────────────────────────────────────── */}
      <section style={{ padding: mobile ? '48px 28px' : '60px 80px', background: 'rgba(197,197,255,0.1)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontWeight: 500, fontSize: mobile ? 24 : 28, letterSpacing: '-0.03em', color: '#0f0f14', marginBottom: 20 }}>why we built immi</h2>
          {[
            "We believe the most important moments in life happen when you aren't looking at a screen. But the tools we use to share those moments afterwards are designed to keep us scrolling, not sharing.",
            "So we built something different. An app that measures success by the quality of your interactions — not the time you spend inside it. One that helps you share what matters with the people who matter, then gets out of your way.",
            "We're in the early stages, and we have a lot of plans. But the foundation is solid: real connection, real privacy, and a real commitment to building technology that serves people instead of exploiting them.",
          ].map((text, i) => (
            <p key={i} style={{ fontWeight: 400, fontSize: 16, lineHeight: 1.75, color: '#2b2c49', opacity: 0.8, marginBottom: i < 2 ? 16 : 0 }}>{text}</p>
          ))}
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: mobile ? '48px 28px 64px' : '80px 80px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: mobile ? 32 : 48 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '-0.04em', color: '#7f83e8', textTransform: 'uppercase', marginBottom: 12 }}>the team</p>
            <h2 style={{ fontWeight: 500, fontSize: 'clamp(24px,3vw,38px)', letterSpacing: '-0.03em', color: '#0f0f14', marginBottom: 12 }}>the people behind immi</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2,1fr)', gap: 16 }}>
            {team.map(({ initial, gradient, name, role, bio }) => (
              <div key={name} style={{
                border: '1.5px solid rgba(43,44,73,0.08)', borderRadius: 18,
                padding: mobile ? 20 : 28,
                display: 'flex', gap: 20, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: gradient, fontWeight: 500, fontSize: 18, color: '#FCFCFF',
                }}>
                  {initial}
                </div>
                <div>
                  <h3 style={{ fontWeight: 500, fontSize: 16, letterSpacing: '-0.02em', color: '#0f0f14', marginBottom: 3 }}>{name}</h3>
                  <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#7f83e8', letterSpacing: '-0.03em', marginBottom: 8 }}>{role}</p>
                  <p style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.65, color: '#6F6F76', margin: 0 }}>{bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Support CTA ───────────────────────────────────────────────────── */}
      <section style={{ background: '#0f0f14', padding: mobile ? '60px 28px' : '80px' }}>
        <div style={{ maxWidth: 560 }}>
          <h2 style={{ fontWeight: 500, fontSize: 'clamp(24px,3vw,38px)', letterSpacing: '-0.03em', color: '#FCFCFF', marginBottom: 16 }}>help us grow.</h2>
          <p style={{ fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: 'rgba(252,252,255,0.5)', marginBottom: 32 }}>
            immi is entirely self-funded. If you believe in what we're building, we'd appreciate any support.
          </p>
          <a href="https://gofund.me/7079b16fc" target="_blank" rel="noreferrer" style={{
            background: '#f2dc62', color: '#0f0f14', fontWeight: 500,
            padding: '13px 26px', borderRadius: 100, textDecoration: 'none',
            fontSize: 14, letterSpacing: '-0.01em', display: 'inline-block',
          }}>
            support us on GoFundMe →
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}