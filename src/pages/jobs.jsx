import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/auth-context'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

function JobsPage() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('all') // Filter options: all, active, applied, interview, rejected, offer

  // Fetch jobs on component mount
  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching jobs for user ID:', user.id)
      fetchJobs()
    } else {
      console.log('No user found, waiting for authentication')
    }
  }, [user])

  // Fetch jobs for the current user
  const fetchJobs = async () => {
    if (!user || !user.id) {
      console.error('No user ID available for fetching jobs')
      return
    }

    try {
      setLoading(true)
      console.log('Fetching jobs for user ID:', user.id)
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching jobs:', error)
        throw error
      }
      
      console.log('Jobs query result:', data)
      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error.message)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  // Filter jobs based on status
  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status?.toLowerCase() === filter)

  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Get appropriate status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return 'bg-indigo-600 text-white'
      case 'applied':
        return 'bg-blue-500 text-white'
      case 'interview':
        return 'bg-amber-500 text-white'
      case 'offer':
        return 'bg-green-500 text-white'
      case 'rejected':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Navigation */}
      <div className="bg-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold">LinkedAI</Link>
              <div className="hidden md:block ml-10">
                <div className="flex space-x-4">
                  <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                    Home
                  </Link>
                  <Link to="/messages" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                    Messages
                  </Link>
                  <Link to="/prompt-templates" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                    Templates
                  </Link>
                  <Link to="/jobs" className="px-3 py-2 rounded-md text-sm font-medium bg-gray-800">
                    Jobs
                  </Link>
                  <Link to="/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                    Profile
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-sm font-medium">{user?.email?.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Job Tracker</h1>
          <p className="text-lg text-indigo-600">Keep track of all your job applications in one place</p>
        </header>
        
        <div className="max-w-6xl mx-auto">
          {/* Filter controls */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('active')} 
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                filter === 'active' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter('applied')} 
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                filter === 'applied' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Applied
            </button>
            <button 
              onClick={() => setFilter('interview')} 
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                filter === 'interview' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Interview
            </button>
            <button 
              onClick={() => setFilter('offer')} 
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                filter === 'offer' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Offer
            </button>
            <button 
              onClick={() => setFilter('rejected')} 
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                filter === 'rejected' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Rejected
            </button>
          </div>
          
          {/* Jobs table */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-gray-500 max-w-md">
                  {filter === 'all' 
                    ? "You don't have any jobs tracked yet."
                    : `You don't have any jobs with '${filter}' status.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Job Title</th>
                      <th className="px-6 py-4 text-left">Company</th>
                      <th className="px-6 py-4 text-left">Date Applied</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{job.job_title}</div>
                          {job.job_id && <div className="text-xs text-gray-500">ID: {job.job_id}</div>}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{job.company || 'Not specified'}</td>
                        <td className="px-6 py-4 text-gray-700">{formatDate(job.created_at)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {job.job_url ? (
                            <a 
                              href={job.job_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                              View Job
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">No link</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>This page displays all your tracked job applications.</p>
            <p>Jobs are automatically added when you apply through LinkedAI.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobsPage 