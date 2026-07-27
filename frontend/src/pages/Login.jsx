import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../api'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      navigate('/products', { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Login failed. Check your credentials.'))
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
        <h2>Sign in</h2>
        <p className="auth-subtitle">Use your PS-App account to continue.</p>

        {error && <p className="error">{error}</p>}

        <div className="form-group">
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            name="username"
            value={form.username}
            onChange={updateField}
            autoComplete="username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            autoComplete="current-password"
            required
          />
        </div>

        <button className="amazon-btn" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="divider">New to PS-App?</div>
        <Link className="new-account-link" to="/register">
          Create your PS-App account
        </Link>
      </form>
    </main>
  )
}

export default Login
