'use client'

import { useState } from 'react'
import { Nav } from '@/components/PostCard/Shared'
import type { Page } from '@/components/PostCard/Shared'
import PageHome   from '@/components/PostCard/PageHome'
import PageAbout  from '@/components/PostCard/PageAbout'
import PageCreate from '@/components/PostCard/PageCreate'
import PageApp from '@/components/PostCard/PageApp'

export default function Home() {
  const [page, setPage] = useState<Page>('home')

  const handleSetPage = (p: Page) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <>
      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          background-color: #FAFBFF;
          background-image: url("public\images\bgTexture.svg") ;
          background-repeat: repeat; 
          background-size: auto;
        }FAFBFF
      `}</style>
      <div style={{
        fontFamily: '"DM Sans", var(--font-geist-sans, sans-serif)',
        color: '#2b2c49',
        background: 'transparent',
      }}>
        <Nav page={page} setPage={handleSetPage}/>
        {page === 'home'  && <PageHome   setPage={handleSetPage}/>}
        {page === 'create'   && <PageCreate setPage={handleSetPage}/>}
        {page === 'about' && <PageAbout  setPage={handleSetPage}/>}
        {page === 'app' && <PageApp  setPage={handleSetPage}/>}
      </div>
    </>
  )
}