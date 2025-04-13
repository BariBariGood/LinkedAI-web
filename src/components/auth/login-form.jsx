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
    <div>
      {error && (
        <div className="alert bg-red-100 border-red-400 text-red-700 mb-4 p-3 rounded-md text-sm">
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleLogin}>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
          <input 
            type="email" 
            className="w-full bg-gray-100 rounded-lg py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
          <input 
            type="password" 
            className="w-full bg-gray-100 rounded-lg py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
          />
        </div>

        {/* Chat icon */}
        <div className="flex justify-center mb-6">
          <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.486 2 2 5.589 2 10c0 2.908 1.898 5.516 5 6.934V22l5.34-4.005C17.697 17.852 22 14.32 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L9 18v-2.417l-.641-.247C5.67 14.301 4 12.256 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z"/>
          </svg>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            type="submit" 
            className="w-full sm:flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none transition duration-150 shadow-md"
            disabled={loading}
          >
            {loading ? <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span> : ''} 
            Login
          </button>
          
          <button 
            type="button" 
            className="w-full sm:flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg focus:outline-none transition duration-150 shadow-sm"
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? <span className="inline-block w-4 h-4 border-2 border-gray-300/20 border-t-gray-300 rounded-full animate-spin mr-2"></span> : ''} 
            Sign Up
          </button>
        </div>
      </form>
    </div>
  )
}

export default LoginForm 