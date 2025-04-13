import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/auth-context'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { 
  getTemplates,
  createTemplate, 
  updateTemplate,
  deleteTemplate 
} from '../lib/templates-service'

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
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: ''
  });

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
    const saveTimer = setTimeout(() => {
      console.log('Auto-saving template...');
      saveTemplate();
    }, 3000); // 3 second delay
    
    // Clear the timer if component unmounts or template changes again
    return () => clearTimeout(saveTimer);
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

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const fetchedTemplates = await getTemplates(user.id);
        setTemplates(fetchedTemplates);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load your templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [user]);

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      return;
    }

    try {
      const createdTemplate = await createTemplate({
        user_id: user.id,
        title: newTemplate.title,
        content: newTemplate.content
      });
      
      setTemplates([...templates, createdTemplate]);
      setNewTemplate({ title: '', content: '' });
    } catch (err) {
      console.error('Error creating template:', err);
      setError('Failed to create template');
    }
  };

  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    if (!editingTemplate || !editingTemplate.title.trim() || !editingTemplate.content.trim()) {
      return;
    }

    try {
      const updatedTemplate = await updateTemplate(editingTemplate.id, {
        title: editingTemplate.title,
        content: editingTemplate.content
      });
      
      setTemplates(templates.map(template => 
        template.id === updatedTemplate.id ? updatedTemplate : template
      ));
      
      setEditingTemplate(null);
    } catch (err) {
      console.error('Error updating template:', err);
      setError('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await deleteTemplate(id);
      setTemplates(templates.filter(template => template.id !== id));
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template');
    }
  };

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

      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">Message Templates</h1>
          <p className="text-indigo-600">Create and manage your LinkedIn message templates</p>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Templates</h2>
                
                {templates.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No templates yet</h3>
                    <p className="text-gray-500">Create a template to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {templates.map(template => (
                      <div key={template.id} className="border border-gray-200 rounded-md p-4">
                        {editingTemplate && editingTemplate.id === template.id ? (
                          <form onSubmit={handleUpdateTemplate} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Title</label>
                              <input 
                                type="text" 
                                value={editingTemplate.title}
                                onChange={e => setEditingTemplate({...editingTemplate, title: e.target.value})}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Content</label>
                              <textarea 
                                value={editingTemplate.content}
                                onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                                rows={5}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <button 
                                type="button"
                                onClick={() => setEditingTemplate(null)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-medium text-gray-900">{template.title}</h3>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => setEditingTemplate(template)}
                                  className="text-indigo-600 hover:text-indigo-800"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteTemplate(template.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <p className="mt-2 text-gray-700 whitespace-pre-line">{template.content}</p>
                            <div className="mt-4 flex justify-end">
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(template.content);
                                  alert('Template copied to clipboard!');
                                }}
                                className="text-indigo-600 hover:text-indigo-800 text-sm"
                              >
                                Copy to clipboard
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Template</h2>
                <form onSubmit={handleCreateTemplate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input 
                      type="text" 
                      value={newTemplate.title}
                      onChange={e => setNewTemplate({...newTemplate, title: e.target.value})}
                      placeholder="Ex: Follow-up After Meeting"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea 
                      value={newTemplate.content}
                      onChange={e => setNewTemplate({...newTemplate, content: e.target.value})}
                      placeholder="Your template content with variables like {{name}}, {{company}}, etc."
                      rows={8}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <button 
                      type="submit"
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Create Template
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PromptTemplatesPage 