import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/auth-context'
import { toast } from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'

function PromptTemplatesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
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
    if (user) {
      console.log('User authenticated, fetching template for user ID:', user.id)
      fetchTemplate()
    } else {
      console.log('No user found, waiting for authentication')
    }
  }, [user])

  // Auto-save when template changes
  useEffect(() => {
    // Skip initial render and only save if we have a template ID
    if (!template.id || !user) return;
    
    // Set up a debounce timer to save after user stops typing
    setAutoSaving(true);
    const saveTimer = setTimeout(() => {
      console.log('Auto-saving template...');
      saveTemplate();
    }, 2000); // 2 second delay
    
    // Clear the timer if component unmounts or template changes again
    return () => {
      clearTimeout(saveTimer);
    };
  }, [template.name, template.description, template.content, template.template_type, template.is_default]);
  
  // Save template function used by auto-save
  const saveTemplate = async () => {
    if (!user || !template.id) return;
    
    try {
      console.log('Auto-saving template with ID:', template.id);
      
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
        .eq('id', template.id);
      
      if (error) {
        console.error('Error auto-saving template:', error);
        return;
      }
      
      console.log('Auto-save completed successfully');
      // No toast notification for auto-save to avoid disturbing user
    } catch (error) {
      console.error('Failed to auto-save template:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  // Fetch the template for the current user
  const fetchTemplate = async () => {
    if (!user || !user.id) {
      console.error('No user ID available for fetching template')
      return
    }

    try {
      setLoading(true)
      console.log('Fetching templates for user ID:', user.id)
      
      // First check if user has a default template
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .limit(1)
      
      if (error) {
        console.error('Error fetching default template:', error)
        throw error
      }
      
      console.log('Default template query result:', data)
      
      // If no default template found, check for any template
      if (!data || data.length === 0) {
        console.log('No default template found, checking for any template')
        const { data: anyTemplate, error: anyError } = await supabase
          .from('prompt_templates')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          
        if (anyError) {
          console.error('Error fetching any template:', anyError)
          throw anyError
        }
        
        console.log('Any template query result:', anyTemplate)
        
        if (anyTemplate && anyTemplate.length > 0) {
          console.log('Found an existing template:', anyTemplate[0])
          setTemplate(anyTemplate[0])
        } else {
          console.log('No templates found, keeping default values')
        }
      } else {
        console.log('Found default template:', data[0])
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
      console.log('Saving template:', template)
      
      // Make sure we have a user
      if (!user || !user.id) {
        console.error('No authenticated user found')
        toast.error('Please log in to save templates')
        return
      }
      
      // Log the user information
      console.log('Current authenticated user:', user)
      
      // If template has an ID, update it, otherwise create new
      if (template.id) {
        console.log('Updating existing template with ID:', template.id)
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
        
        if (error) {
          console.error('Supabase error updating template:', error)
          throw error
        }
        
        console.log('Template updated successfully')
        toast.success('Template updated successfully!')
      } else {
        console.log('Creating new template for user:', user.id)
        // Create new template
        const { data, error } = await supabase
          .from('prompt_templates')
          .insert({
            name: template.name,
            description: template.description,
            template_type: template.template_type,
            content: template.content,
            is_default: template.is_default,
            user_id: user.id
          })
          .select()
        
        if (error) {
          console.error('Supabase error creating template:', error)
          throw error
        }
        
        console.log('New template created with ID:', data[0]?.id)
        // Update local state with the new template ID
        if (data && data[0]) {
          setTemplate(prev => ({ ...prev, id: data[0].id }))
        } else {
          console.error('No data returned from insert operation')
        }
        toast.success('Template saved successfully!')
      }
    } catch (error) {
      console.error('Error saving template:', error.message)
      toast.error(`Failed to save template: ${error.message}`)
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
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Message Template</h1>
          <p className="text-lg text-indigo-600">Customize your LinkedIn message template</p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Template</h2>
                {autoSaving && (
                  <div className="flex items-center text-sm text-indigo-600">
                    <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Auto-saving...
                  </div>
                )}
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-indigo-600">Loading your template...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                    <input
                      type="text"
                      name="name"
                      value={template.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                      <select
                        name="template_type"
                        value={template.template_type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required
                      >
                        <option value="description">Description</option>
                        <option value="example">Example</option>
                        <option value="cold-outreach">Cold Outreach</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="job-application">Job Application</option>
                      </select>
                    </div>
                    
                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        name="description"
                        value={template.description}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="form-control">
                    <label className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Content</span>
                      <span className="text-sm text-indigo-600">Use this for your LinkedIn messages</span>
                    </label>
                    <div className="relative">
                      <textarea
                        name="content"
                        value={template.content}
                        onChange={handleChange}
                        rows="12"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Hi [Name],

I hope this message finds you well. Let me start by saying that I am a big fan of your work and it has inspired me to push myself beyond what I thought were my limits!

I am reaching out because [reason].

After taking a good look at [target company] I realize that you could improve in [improvement area]. I have helped many others improve in the same area and I'd be more than happy to talk with you about it!"
                        required
                      ></textarea>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        This template will be used to generate your LinkedIn messages
                      </p>
                      <p className="text-xs text-indigo-600">
                        Use [Name], [target company], [improvement area], [reason] as placeholders
                      </p>
                    </div>
                  </div>
                  
                  <div className="form-control">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        name="is_default"
                        checked={template.is_default} 
                        onChange={handleChange}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors" 
                      />
                      <span className="text-sm text-gray-700">Set as default template</span>
                    </label>
                  </div>
                  
                  <div className="flex justify-end gap-4 mt-8">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Save Template
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500 bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-center mb-2">
              <svg className="h-5 w-5 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h.01a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Template Information</span>
            </div>
            <p>This template will be used when generating LinkedIn messages.</p>
            <p>Your changes are automatically saved to your account.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptTemplatesPage 