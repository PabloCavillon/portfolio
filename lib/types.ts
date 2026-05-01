export interface Work {
  id: string
  title: string
  description: string
  category: string
  type: 'single' | 'before-after'
  imageUrl: string | null
  beforeImageUrl: string | null
  afterImageUrl: string | null
  createdAt: string
  order: number
}
