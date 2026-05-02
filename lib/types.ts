export interface User {
  id: string
  username: string
  displayName: string
  bio: string
  isAdmin: boolean
  createdAt: string
}

export interface Work {
  id: string
  userId: string
  title: string
  description: string
  categories: string[]
  type: 'single' | 'before-after'
  imageUrl: string | null
  beforeImageUrl: string | null
  afterImageUrl: string | null
  order: number
  collectionId: string | null
  createdAt: string
}

export interface Collection {
  id: string
  userId: string
  name: string
  description: string
  orderIndex: number
  workCount: number
  createdAt: string
}
