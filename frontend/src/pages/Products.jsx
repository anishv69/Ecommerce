import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import api, { getErrorMessage } from '../api'
import { getProductImage, handleProductImageError } from '../productImages'

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function Products() {
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    let active = true

    api
      .get('/products')
      .then(({ data }) => {
        if (active) setProducts(data)
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError, 'Products could not be loaded.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return products

    return products.filter((product) =>
      [product.name, product.description].filter(Boolean).some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    )
  }, [products, query])

  async function addToCart(product) {
    try {
      await api.post('/cart', {
        userId: localStorage.getItem('username'),
        productId: product.id,
        quantity: 1,
      })
      setToast(`${product.name} added to your cart.`)
    } catch (requestError) {
      setToast(getErrorMessage(requestError, 'Could not add the product to your cart.'))
    }

    window.setTimeout(() => setToast(''), 3000)
  }

  return (
    <>
      <Navbar onSearch={setQuery} />
      {toast && <div className="toast">{toast}</div>}

      <main className="container">
        <h1 className="products-header">Recommended products</h1>

        {loading && <p className="page-message">Loading products...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && visibleProducts.length === 0 && (
          <p className="page-message">
            {products.length === 0 ? 'No products are available yet.' : 'No products match your search.'}
          </p>
        )}

        <section className="product-grid" aria-label="Products">
          {visibleProducts.map((product) => {
            const inStock = product.stockQuantity > 0

            return (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img
                    src={getProductImage(product)}
                    alt={`${product.name} product`}
                    loading="lazy"
                    onError={handleProductImageError}
                  />
                </div>
                <h3>{product.name}</h3>
                <p>{product.description || 'Quality product from PS-App.'}</p>
                <div className="product-rating">★★★★★</div>
                <div className="price">{money.format(Number(product.price) || 0)}</div>
                <div className="stock">{inStock ? `${product.stockQuantity} in stock` : 'Out of stock'}</div>
                <button
                  className="add-to-cart-btn"
                  type="button"
                  disabled={!inStock}
                  onClick={() => addToCart(product)}
                >
                  {inStock ? 'Add to Cart' : 'Unavailable'}
                </button>
              </article>
            )
          })}
        </section>
      </main>
    </>
  )
}

export default Products
