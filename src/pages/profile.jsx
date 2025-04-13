import { useAuth } from '../context/auth-context'
import { useNavigate, Link } from 'react-router-dom'

function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="navbar bg-base-100 shadow-md">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl">LinkedAI</Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/messages">Messages</Link></li>
            <li><Link to="/prompt-templates">Templates</Link></li>
            <li><Link to="/profile" className="active">Profile</Link></li>
          </ul>
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-white grid place-items-center">
                <span className="text-lg font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/messages">Messages</Link></li>
              <li><Link to="/prompt-templates">Templates</Link></li>
              <li><button onClick={handleSignOut}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold mb-6">Your Profile</h2>
            
            <div className="alert alert-success mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>You are authenticated! The auth token is stored in your browser.</span>
            </div>
            
            <div className="bg-base-200 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">User Information</h3>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <tbody>
                    <tr>
                      <td className="font-medium">User ID</td>
                      <td className="font-mono text-sm">{user?.id}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Email</td>
                      <td>{user?.email}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Last Sign In</td>
                      <td>{new Date(user?.last_sign_in_at).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="card-actions justify-end">
              <Link to="/messages" className="btn btn-primary">
                View Messages
              </Link>
              <Link to="/" className="btn btn-primary">
                Go to Home
              </Link>
              <button className="btn btn-outline" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage 