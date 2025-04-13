import { useState, useEffect } from 'react'
import { useAuth } from './context/auth-context'
import { getUserResume } from './lib/resume-service'

// Resume components
import ResumeUpload from './components/resume/resume-upload'
import ResumeViewer from './components/resume/resume-viewer'
import ResumeJsonEditor from './components/resume/resume-json-editor'
import Navbar from './components/layout/Navbar'

function App() {
  const { user } = useAuth()
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
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Resume Parser</h1>
          <p className="text-lg text-indigo-600">Upload your resume and we'll automatically parse it for you.</p>
        </header>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 max-w-4xl mx-auto">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : !resumeData ? (
          <div className="max-w-4xl mx-auto">
            <ResumeUpload onResumeProcessed={handleResumeProcessed} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            <div>
              <ResumeViewer resumeData={resumeData} />
            </div>
            <div>
              <ResumeJsonEditor 
                resumeData={resumeData} 
                onUpdate={handleResumeUpdate} 
              />
            </div>
            
            <div className="lg:col-span-2 mt-4">
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Upload a New Resume</h2>
                <p className="text-gray-600 mb-4">
                  Want to upload a different resume? Your current resume will be replaced.
                </p>
                <button 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  onClick={() => {
                    console.log('User clicked to upload new resume');
                    setResumeData(null);
                  }}
                >
                  Upload New Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App 