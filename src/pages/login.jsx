import LoginForm from '../components/auth/login-form'

function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">LinkedAI</h1>
          <p className="text-lg text-blue-600">Sign in to access your AI solutions</p>
        </div>
        
        <LoginForm />
        
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Use your email and password to sign in or create a new account.</p>
          <p>The auth token will be stored in your browser automatically.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 