
import type { Page } from '@/components/PostCard/Shared'
import PostcardBuilder from '@/components/PostcardBuilder'

export default function PageCreate({ setPage }: { setPage: (p: Page) => void }) {
  return <PostcardBuilder setPage={setPage} />
}