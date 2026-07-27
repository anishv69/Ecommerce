const imageOptions = [
  {
    terms: ['headphone'],
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85',
  },
  {
    terms: ['watch'],
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85',
  },
  {
    terms: ['speaker'],
    url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=85',
  },
  {
    terms: ['charging', 'usb-c', 'hub'],
    url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=85',
  },
  {
    terms: ['chair'],
    url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=85',
  },
  {
    terms: ['backpack'],
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=85',
  },
  {
    terms: ['keyboard'],
    url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=85',
  },
  {
    terms: ['mouse'],
    url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=85',
  },
  {
    terms: ['webcam'],
    url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=85',
  },
  {
    terms: ['laptop', 'stand'],
    url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=85',
  },
  {
    terms: ['lamp'],
    url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=85',
  },
]

export const fallbackProductImage = '/product-placeholder.svg'

export function getProductImage(product) {
  const suppliedImage = product?.imageUrl || product?.image
  if (suppliedImage) return suppliedImage

  const productName = String(product?.name || product?.productName || '').toLowerCase()
  return imageOptions.find(({ terms }) => terms.some((term) => productName.includes(term)))?.url || fallbackProductImage
}

export function handleProductImageError(event) {
  const image = event.currentTarget
  if (!image.src.endsWith(fallbackProductImage)) {
    image.src = fallbackProductImage
  }
}
