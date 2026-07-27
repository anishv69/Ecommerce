import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar({ onSearch }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const username = localStorage.getItem('username') || 'Account'

  function handleSearch(event) {
    event.preventDefault()
    onSearch?.(query)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-top">
        <Link className="navbar-logo" to="/products">
          PS-App
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            aria-label="Search products"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              onSearch?.(event.target.value)
            }}
            placeholder="Search products"
          />
          <button type="submit" aria-label="Search">
            🔍
          </button>
        </form>

        <div className="navbar-right">
          <span className="navbar-item">
            <span className="small">Hello, {username}</span>
            <br />
            <span className="large">Account</span>
          </span>
          <Link className="navbar-cart" to="/cart">
            🛒 Cart
          </Link>
          <button className="navbar-item navbar-button" type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>

      <nav className="navbar-bottom" aria-label="Main navigation">
        <Link to="/products">Products</Link>
        <Link to="/cart">Your Cart</Link>
      </nav>
    </header>
  )
}

export default Navbar
