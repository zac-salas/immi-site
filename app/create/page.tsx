'use client'

import { useRouter } from 'next/navigation'
import PageCreate from '@/components/PostCard/PageCreate'
import type { Page } from '@/components/PostCard/Shared'

export default function CreatePage() {
  const router = useRouter()

  function handleSetPage(p: Page) {
    if (p === 'home') router.push('/')
    else router.push(`/${p}`)
  }

  return <PageCreate setPage={handleSetPage} />
}