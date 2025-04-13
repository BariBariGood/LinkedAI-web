import MessageHistory from '../components/messages/message-history';
import { useAuth } from '../context/auth-context';
import { Link } from 'react-router-dom';

function MessagesPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="navbar bg-base-100 shadow-md">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl">LinkedAI</Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/messages" className="active">Messages</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>
        <div className="navbar-end">
          {user && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-primary text-white grid place-items-center">
                  <span className="text-lg font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/">Home</Link></li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">LinkedIn Messages</h1>
          <p className="text-lg text-blue-600">View and manage your generated LinkedIn messages</p>
        </header>
        
        <MessageHistory />
      </div>
    </div>
  );
}

export default MessagesPage; 