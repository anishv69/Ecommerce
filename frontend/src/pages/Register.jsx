import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../api'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { data } = await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      navigate('/products', { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Registration failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <Link className="auth-logo" to="/login">
        PS-App
      </Link>
      <form className="form-container" onSubmit={submit}>
        <h2>Create account</h2>
        <p className="auth-subtitle">Join PS-App to shop and manage your cart.</p>

        {error && <p className="error">{error}</p>}

        <div className="form-group">
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            name="username"
            value={form.username}
            onChange={updateField}
            autoComplete="username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            autoComplete="new-password"
            minLength="6"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-confirm-password">Confirm password</label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={updateField}
            autoComplete="new-password"
            minLength="6"
            required
          />
        </div>

        <button className="amazon-btn" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <Link className="new-account-link" to="/login">
          Already have an account? Sign in
        </Link>
      </form>
    </main>
  )
}

export default Register
