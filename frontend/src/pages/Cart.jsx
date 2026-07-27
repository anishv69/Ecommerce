import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import api, { getErrorMessage } from '../api'
import { getProductImage, handleProductImageError } from '../productImages'

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function Cart() {
  const userId = localStorage.getItem('username')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    if (!userId) return () => {
      active = false
    }

    api
      .get(`/cart/${encodeURIComponent(userId)}`)
      .then(({ data }) => {
        if (active) {
          setItems(data)
          setError('')
        }
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError, 'Your cart could not be loaded.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [userId])

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + Number(item.productPrice || 0) * item.quantity, 0),
    [items],
  )

  async function removeItem(itemId) {
    try {
      await api.delete(`/cart/item/${itemId}`)
      setItems((current) => current.filter((item) => item.id !== itemId))
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'The cart item could not be removed.'))
    }
  }

  async function clearCart() {
    if (!userId) return

    try {
      await api.delete(`/cart/${encodeURIComponent(userId)}`)
      setItems([])
      setMessage('Your cart has been cleared.')
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'The cart could not be cleared.'))
    }
  }

  return (
    <>
      <Navbar />
      <main className="cart-container">
        <section className="cart-main">
          <h1>Your Cart</h1>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          {loading && <p className="page-message">Loading your cart...</p>}

          {!loading && items.length === 0 && (
            <p className="page-message">Your cart is empty. Add something from the products page.</p>
          )}

          {items.map((item) => (
            <article className="cart-item" key={item.id}>
              <div className="cart-item-image">
                <img
                  src={getProductImage(item)}
                  alt={`${item.productName} product`}
                  loading="lazy"
                  onError={handleProductImageError}
                />
              </div>
              <div className="cart-item-details">
                <h2>{item.productName}</h2>
                <div className="cart-item-stock">In your cart</div>
                <div className="cart-item-price">{money.format(Number(item.productPrice) || 0)}</div>
                <div className="cart-item-actions">
                  <span className="qty-selector">Qty: {item.quantity}</span>
                  <button className="cart-action-btn" type="button" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="cart-sidebar">
          <p className="subtotal">
            Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'}): <span>{money.format(subtotal)}</span>
          </p>
          <button className="checkout-btn" type="button" onClick={() => setMessage('Checkout is coming soon.')}>
            Proceed to checkout
          </button>
          <button className="clear-cart-btn" type="button" onClick={clearCart} disabled={items.length === 0}>
            Clear cart
          </button>
        </aside>
      </main>
    </>
  )
}

export default Cart
