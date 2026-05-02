export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'coleccion'
}

export function collectionUrl(username: string, collectionId: string, name: string): string {
  return `/${username}/c/${collectionId}/${toSlug(name)}`
}
