import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">LinkedAI</Link>
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActiveRoute('/') ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                >
                  Home
                </Link>
                <Link 
                  to="/messages" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActiveRoute('/messages') ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                >
                  Messages
                </Link>
                {/* <Link 
                  to="/prompt-templates" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActiveRoute('/prompt-templates') ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                >
                  Templates
                </Link> */}
                <Link 
                  to="/jobs" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActiveRoute('/jobs') ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                >
                  Jobs
                </Link>
                <Link 
                  to="/profile" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActiveRoute('/profile') ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>
          {user && (
            <div>
              <div className="ml-4 flex items-center md:ml-6">
                <Link to="/profile" className="relative">
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center cursor-pointer hover:bg-indigo-600 transition-colors">
                    <span className="text-sm font-medium">{user?.email?.charAt(0).toUpperCase()}</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar; 