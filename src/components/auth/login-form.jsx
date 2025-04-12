import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await signIn({ email, password })
      if (error) throw error
      navigate('/')
    } catch (error) {
      setError(error.message)
      console.error('Error logging in:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await signUp({ email, password })
      if (error) throw error
      setError(null)
      alert('Check your email for the confirmation link!')
    } catch (error) {
      setError(error.message)
      console.error('Error signing up:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card w-full max-w-md bg-base-100 shadow-xl mx-auto">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold mb-6">Login to LinkedAI</h2>
        
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input 
              type="email" 
              className="input input-bordered" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input 
              type="password" 
              className="input input-bordered" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              type="submit" 
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Login'}
            </button>
            
            <button 
              type="button" 
              className="btn btn-outline flex-1"
              onClick={handleSignUp}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm 