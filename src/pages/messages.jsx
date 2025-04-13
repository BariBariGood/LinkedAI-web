import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { getGeneratedMessages } from '../lib/messages-service';
import Navbar from '../components/layout/Navbar';
import { toast } from 'react-hot-toast';

function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [copyStatus, setCopyStatus] = useState({});

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const fetchedMessages = await getGeneratedMessages(user.id);
        console.log('Fetched messages:', fetchedMessages);
        setMessages(fetchedMessages || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load your messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  // Helper to format date in a readable way
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  // Copy to clipboard with visual feedback
  const copyToClipboard = async (text, id) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      
      // Update copy status for this message
      setCopyStatus(prev => ({ ...prev, [id]: true }));
      
      // Show success toast
      toast.success('Message copied to clipboard!');
      
      // Reset copy status after 2 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast.error('Failed to copy message');
    }
  };

  // View message details
  const viewMessageDetails = (message) => {
    console.log('Viewing message details:', message);
    setSelectedMessage(message);
  };

  // Close message modal
  const closeMessageModal = () => {
    setSelectedMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Generated Messages</h1>
          <p className="text-lg text-indigo-600">View all your LinkedIn messages generated with LinkedAI</p>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-lg">
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
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-xl p-10 text-center max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No messages yet</h3>
            <p className="text-gray-500 mb-6">You haven't generated any LinkedIn messages yet.</p>
            <Link to="/" className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-block font-medium">
              Generate Your First Message
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Recipient</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Date</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[45%]">Message Preview</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messages.map((message) => (
                    <tr key={message.id || Math.random()} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-normal">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{message.recipient_name || 'Unknown'}</div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800">{formatDate(message.created_at)}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-md" title={message.message}>
                          {message.message ? 
                            (message.message.length > 50 ? 
                              `${message.message.substring(0, 50)}...` : 
                              message.message) : 
                            'No content'}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <button 
                            onClick={() => viewMessageDetails(message)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => copyToClipboard(message.message, message.id)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            disabled={!message.message}
                          >
                            {copyStatus[message.id] ? 'Copied!' : 'Copy'}
                          </button>
                          {message.url && (
                            <a 
                              href={message.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            >
                              LinkedIn
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Message to {selectedMessage.recipient_name || 'Unknown'}
                </h3>
                <button 
                  onClick={closeMessageModal}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  aria-label="Close"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                  Created: {formatDate(selectedMessage.created_at)}
                </p>
                {selectedMessage.recipient_title && (
                  <p className="text-sm text-gray-700">
                    {selectedMessage.recipient_title}
                    {selectedMessage.recipient_company && ` • ${selectedMessage.recipient_company}`}
                  </p>
                )}
              </div>
              
              <div className="border rounded-lg p-5 bg-gray-50 mb-6 whitespace-pre-wrap text-base text-black font-normal">
                {selectedMessage.message || 'No message content available.'}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  {selectedMessage.url && (
                    <a 
                      href={selectedMessage.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none transition-colors"
                    >
                      <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                      </svg>
                      View LinkedIn Profile
                    </a>
                  )}
                </div>
                
                <button 
                  onClick={() => copyToClipboard(selectedMessage.message, `modal-${selectedMessage.id}`)}
                  className="inline-flex items-center px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors w-full sm:w-auto justify-center sm:justify-start"
                >
                  {copyStatus[`modal-${selectedMessage.id}`] ? (
                    <>
                      <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                      </svg>
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPage; 