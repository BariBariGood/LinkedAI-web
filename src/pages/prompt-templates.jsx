import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/auth-context'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

function PromptTemplatesPage() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [template, setTemplate] = useState({
    id: null,
    name: 'My Template',
    description: 'Edit this template to customize your messages',
    template_type: 'description',
    content: '',
    is_default: true
  })

  // Fetch template on component mount
  useEffect(() => {
    fetchTemplate()
  }, [])

  // Fetch the template for the current user
  const fetchTemplate = async () => {
    try {
      setLoading(true)
      
      // First check if user has a default template
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .limit(1)
      
      if (error) throw error
      
      // If no default template found, check for any template
      if (data.length === 0) {
        const { data: anyTemplate, error: anyError } = await supabase
          .from('prompt_templates')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          
        if (anyError) throw anyError
        
        if (anyTemplate.length > 0) {
          setTemplate(anyTemplate[0])
        }
      } else {
        setTemplate(data[0])
      }
    } catch (error) {
      console.error('Error fetching template:', error.message)
      toast.error('Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setTemplate({
      ...template,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // If template has an ID, update it, otherwise create new
      if (template.id) {
        // Update existing template
        const { error } = await supabase
          .from('prompt_templates')
          .update({
            name: template.name,
            description: template.description,
            template_type: template.template_type,
            content: template.content,
            is_default: template.is_default,
            updated_at: new Date()
          })
          .eq('id', template.id)
        
        if (error) throw error
        
        toast.success('Template updated successfully!')
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('prompt_templates')
          .insert({
            ...template,
            user_id: user.id
          })
          .select()
        
        if (error) throw error
        
        // Update local state with the new template ID
        setTemplate(prev => ({ ...prev, id: data[0].id }))
        toast.success('Template saved successfully!')
      }
    } catch (error) {
      console.error('Error saving template:', error.message)
      toast.error('Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  // Handle resetting the template
  const handleReset = () => {
    if (confirm('Are you sure you want to reset this template? All changes will be lost.')) {
      fetchTemplate()
      toast.success('Template has been reset')
    }
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
            <li><Link to="/prompt-templates" className="active">Templates</Link></li>
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
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Message Template</h1>
          <p className="text-lg text-blue-600">Customize your LinkedIn message template</p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl font-bold mb-6">Edit Template</h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Template Name</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={template.name}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Template Type</span>
                      </label>
                      <select
                        name="template_type"
                        value={template.template_type}
                        onChange={handleChange}
                        className="select select-bordered w-full"
                        required
                      >
                        <option value="description">Description</option>
                        <option value="example">Example</option>
                      </select>
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Description</span>
                      </label>
                      <input
                        type="text"
                        name="description"
                        value={template.description}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Content</span>
                      <span className="label-text-alt text-blue-600">Use this for your LinkedIn messages</span>
                    </label>
                    <textarea
                      name="content"
                      value={template.content}
                      onChange={handleChange}
                      rows="10"
                      className="textarea textarea-bordered font-mono text-sm w-full"
                      placeholder="Enter your template text here. You can use placeholders like {name}, {company}, etc."
                      required
                    ></textarea>
                    <label className="label">
                      <span className="label-text-alt">This template will be used to generate your LinkedIn messages</span>
                    </label>
                  </div>
                  
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input 
                        type="checkbox" 
                        name="is_default"
                        checked={template.is_default} 
                        onChange={handleChange}
                        className="checkbox checkbox-primary" 
                      />
                      <span className="label-text">Set as default template</span>
                    </label>
                  </div>
                  
                  <div className="card-actions justify-end mt-6">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn btn-outline"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Saving...
                        </>
                      ) : 'Save Template'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>This template will be used when generating LinkedIn messages.</p>
            <p>Your changes are automatically saved to your account.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptTemplatesPage 