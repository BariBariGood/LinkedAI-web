import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './context/auth-context'
import { getUserResume } from './lib/resume-service'

// Resume components
import ResumeUpload from './components/resume/resume-upload'
import ResumeViewer from './components/resume/resume-viewer'
import ResumeJsonEditor from './components/resume/resume-json-editor'

function App() {
  const { user, signOut } = useAuth()
  const [resumeData, setResumeData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadUserResume = async () => {
      if (!user) {
        console.log('No authenticated user found, skipping resume loading');
        setIsLoading(false);
        return;
      }
      
      console.log('Loading resume for user:', user.id);
      
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('Fetching resume data from Supabase');
        const resume = await getUserResume(user.id)
        
        console.log('Resume data fetch result:', resume ? 'Success' : 'No resume found');
        if (resume) {
          console.log('Resume data ID:', resume.id);
        }
        
        setResumeData(resume)
      } catch (err) {
        console.error('Error loading resume:', err)
        const errorMessage = err.message || 'Failed to load resume data';
        console.log('Setting error state:', errorMessage);
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }
    
    console.log('App component mounted or user changed, loading resume');
    loadUserResume()
  }, [user])

  const handleResumeProcessed = (newResumeData) => {
    console.log('Resume processed, updating state:', newResumeData?.id);
    setResumeData(newResumeData)
  }

  const handleResumeUpdate = (updatedResumeData) => {
    console.log('Resume updated, updating state:', updatedResumeData?.id);
    setResumeData(updatedResumeData)
  }
  
  console.log('App rendering with state:', { 
    isAuthenticated: !!user, 
    isLoading, 
    hasResume: !!resumeData,
    hasError: !!error 
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="navbar bg-base-100 shadow-md">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl">LinkedAI</Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><Link to="/" className="active">Home</Link></li>
            <li><Link to="/messages">Messages</Link></li>
            <li><Link to="/prompt-templates">Templates</Link></li>
            <li><Link to="/profile">Profile</Link></li>
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
              <li><button onClick={signOut}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Resume Parser</h1>
          <p className="text-lg text-blue-600">Upload your resume and we'll automatically parse it for you.</p>
        </header>
        
        {error && (
          <div className="alert alert-error mb-6 max-w-4xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : !resumeData ? (
          <div className="max-w-4xl mx-auto">
            <ResumeUpload onResumeProcessed={handleResumeProcessed} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-4">
            <ResumeViewer 
              resumeData={resumeData} 
              onNewUpload={() => {
                console.log('User clicked to upload new resume');
                setResumeData(null);
              }}
            />
            <ResumeJsonEditor 
              resumeData={resumeData} 
              onUpdate={handleResumeUpdate}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App 