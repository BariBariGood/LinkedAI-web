import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import Navbar from '../components/layout/Navbar';

function ProfilePage() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      // Redirect happens automatically via auth context
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 px-8 py-6">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            </div>
            
            <div className="px-8 py-6 space-y-6">
              {user ? (
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Information</h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-base font-medium text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">User ID</p>
                          <p className="text-base font-medium text-gray-900">{user.id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Last Sign In</p>
                          <p className="text-base font-medium text-gray-900">
                            {new Date(user.last_sign_in_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Status</h2>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-green-700">
                        <span className="inline-flex items-center mr-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                        You are authenticated and your session is active.
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        The authentication token is stored securely in your browser using localStorage.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      onClick={handleSignOut}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Signing Out...' : 'Sign Out'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You are not signed in</p>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage; 