import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/auth-context';
import './message-history.css';

function MessageHistory() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('generated_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        console.log('Fetched messages:', data);
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [user]);
  
  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Set success status for this message
      setCopyStatus(prev => ({ ...prev, [id]: 'copied' }));
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [id]: null }));
      }, 2000);
      
    } catch (err) {
      console.error('Failed to copy message:', err);
      setCopyStatus(prev => ({ ...prev, [id]: 'error' }));
      
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [id]: null }));
      }, 2000);
    }
  };
  
  if (!user) {
    return (
      <div className="message-history">
        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4">Message History</h2>
          <p>Please sign in to view your message history.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="message-history">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold mb-6">Your LinkedIn Message History</h2>
          
          {loading ? (
            <div className="flex justify-center my-8">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : messages.length === 0 ? (
            <div className="alert bg-base-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>No messages found. Generate some messages to see them here.</span>
            </div>
          ) : (
            <div className="message-list space-y-6">
              {messages.map(message => (
                <div key={message.id} className="message-card bg-base-200 rounded-lg shadow overflow-hidden">
                  <div className="message-header bg-base-300 p-4">
                    <h3 className="font-bold text-lg">{message.recipient_name}</h3>
                    <div className="text-sm opacity-70">
                      {message.recipient_title && (
                        <span className="block">{message.recipient_title} {message.recipient_company ? `at ${message.recipient_company}` : ''}</span>
                      )}
                      <time className="text-xs opacity-60">{new Date(message.created_at).toLocaleString()}</time>
                    </div>
                  </div>
                  
                  <div className="message-body p-4 whitespace-pre-wrap text-sm">
                    {message.message}
                  </div>
                  
                  <div className="message-actions flex gap-2 p-4 bg-base-300">
                    <button 
                      onClick={() => copyToClipboard(message.message, message.id)}
                      className={`btn ${copyStatus[message.id] === 'copied' ? 'btn-success' : 'btn-primary'}`}
                      disabled={copyStatus[message.id] === 'copied'}
                    >
                      {copyStatus[message.id] === 'copied' ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                    
                    {message.url && (
                      <a 
                        href={message.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                        View LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageHistory; 