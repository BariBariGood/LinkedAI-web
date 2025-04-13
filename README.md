# LinkedAI - Resume Parser & LinkedIn Integration

A modern web application that parses resumes into structured JSON data, designed to integrate with a Chrome extension for LinkedIn cold messaging.

## Overview

LinkedAI is a powerful resume parsing tool that extracts structured data from resume documents. The web application uses Supabase for authentication and storage, making it easy to build a Chrome extension that can access this data for LinkedIn automation.

## Authentication System

The application uses Supabase authentication, which stores JWT tokens in local storage. These tokens can be accessed by a Chrome extension to authenticate API requests.

### Token Storage

- **Storage Location:** Browser's localStorage
- **Key Format:** `sb-${projectRef}-auth-token`
- **Project Reference:** `okeurgyhsrgcidiqubbe`
- **Full Key:** `sb-okeurgyhsrgcidiqubbe-auth-token`

The token is a JWT that contains user authentication information required for API access. The Supabase client handles token refresh automatically when configured with `autoRefreshToken: true`.

### Cross-Tab Authentication Synchronization

When a user logs in or out in one tab, all other open tabs (including the Chrome extension) need to reflect this change. We use the `storage` event listener to handle this:

```javascript
// Add this to your Chrome extension background script
window.addEventListener('storage', (event) => {
  // Check if the Supabase token changed
  if (event.key === 'sb-okeurgyhsrgcidiqubbe-auth-token') {
    // Token was updated in another tab
    if (event.newValue) {
      console.log('User logged in from another tab');
      // Update extension state to reflect authenticated user
      chrome.runtime.sendMessage({ 
        action: 'AUTH_STATE_CHANGED', 
        state: 'SIGNED_IN',
        token: event.newValue
      });
    } else {
      console.log('User logged out from another tab');
      // Update extension state to reflect logged out user
      chrome.runtime.sendMessage({ 
        action: 'AUTH_STATE_CHANGED', 
        state: 'SIGNED_OUT' 
      });
    }
  }
});
```

For the LinkedAI web application, ensure it broadcasts changes to localStorage:

```javascript
// When user logs in
const broadcastLogin = (token) => {
  // Store in localStorage (Supabase does this automatically)
  // But also dispatch a storage event for any other tabs
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'sb-okeurgyhsrgcidiqubbe-auth-token',
    newValue: token
  }));
};

// When user logs out
const broadcastLogout = () => {
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'sb-okeurgyhsrgcidiqubbe-auth-token',
    newValue: null
  }));
};
```

This ensures that when a user logs in on one tab, the Chrome extension will immediately be aware of the authentication state change, even if it was already open on LinkedIn.

## Resume Data Structure

When a resume is parsed, it's converted into a structured JSON format with the following sections:

```json
{
  "id": "unique-id",
  "userId": "user-uuid",
  "basicInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, State",
    "linkedin": "https://linkedin.com/in/profile"
  },
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Name",
      "field": "Field of Study",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "description": "Job description...",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "rawText": "Original resume text..."
}
```

## Message History

The application stores all generated LinkedIn messages in the Supabase database. You can access your message history through the Chrome extension or view it in the web application. Each message includes:

- Recipient name, title, and company
- Generated message content
- Reference to the resume used
- LinkedIn URL (if available)
- Timestamp of when it was created

### Accessing Message History

#### In the Chrome Extension:

Add this component to your extension to display and copy previously sent messages:

```javascript
// Message history component
const MessageHistoryComponent = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMessages = async () => {
      const token = getAuthToken();
      if (!token) return;
      
      try {
        const response = await fetch(
          'https://okeurgyhsrgcidiqubbe.supabase.co/rest/v1/generated_messages?select=*&order=created_at.desc',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'apikey': 'YOUR_ANON_KEY',
              'Content-Type': 'application/json'
            }
          }
        );
        
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, []);
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show success toast or notification
        console.log('Message copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy message:', err);
      });
  };
  
  return (
    <div className="message-history">
      <h2>Message History</h2>
      
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : messages.length === 0 ? (
        <p>No messages found. Start generating messages to see them here.</p>
      ) : (
        <div className="message-list">
          {messages.map(message => (
            <div key={message.id} className="message-card">
              <div className="message-header">
                <h3>{message.recipient_name}</h3>
                <span>{message.recipient_title} at {message.recipient_company}</span>
                <time>{new Date(message.created_at).toLocaleString()}</time>
              </div>
              
              <div className="message-body">
                <p>{message.message}</p>
              </div>
              
              <div className="message-actions">
                <button 
                  onClick={() => copyToClipboard(message.message)}
                  className="copy-button"
                >
                  <span className="icon">📋</span> Copy to Clipboard
                </button>
                
                {message.url && (
                  <a 
                    href={message.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-profile-button"
                  >
                    View Profile
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

Add this CSS to style the component:

```css
.message-history {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.message-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  overflow: hidden;
}

.message-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
}

.message-header h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
}

.message-header span {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.message-header time {
  font-size: 12px;
  color: #888;
}

.message-body {
  padding: 16px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-actions {
  display: flex;
  padding: 8px 16px 16px;
  gap: 8px;
}

.copy-button {
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}

.copy-button:hover {
  background: #3a7bc8;
}

.view-profile-button {
  background: transparent;
  color: #4a90e2;
  border: 1px solid #4a90e2;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: background 0.2s;
}

.view-profile-button:hover {
  background: #f0f7ff;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 32px;
  color: #666;
}
```

#### Example Message from Database:

```json
{
  "id": "602ca2dd-3b21-4e99-aa3d-c5dd95a50200",
  "created_at": "2025-04-13 04:40:26.738244+00",
  "user_id": "c8ddbd4b-fef9-4283-b654-8dca78b86382",
  "message": "I noticed your work recruiting for Google Cloud, Dhivya, and was impressed by your experience. My background aligns well with Google Cloud's focus on cutting-edge technology. As a Computer Engineering student at UC Santa Cruz graduating in June 2026, I've developed strong skills in AI/ML, including experience with LLMs (researching hallucination optimization and building a RAG model), and cloud infrastructure (using Kubernetes, Docker and Nautilus).\n\nMy projects further demonstrate my practical abilities. Slug-Mart.com, a scalable online marketplace I founded, handled 10,000+ daily API requests using a robust backend architecture and Google OAuth. My experience leading a team on the SlugDining app, which utilizes Firebase and web scraping, showcases my ability to manage projects and deliver results. I've also led workshops for large student organizations, teaching practical skills in AI and software development.\n\nI'm confident my skills and experience would be a valuable asset to Google Cloud. Would you be open to a brief conversation to discuss how my abilities could contribute to your team?",
  "recipient_name": "Dhivya Venkatesh, MBA, PHR, SHRM-CP | LinkedIn",
  "recipient_title": "Recruiting For Google Cloud :)",
  "recipient_company": "San Francisco Bay Area",
  "resume_id": "11a61535-deed-48a1-afa4-7dde8915fe1b",
  "url": "https://www.linkedin.com/in/dhivya-venkatesh-mba-phr-shrm-cp-0025b610/"
}
```

## Chrome Extension Integration

### Accessing the Auth Token

Your Chrome extension can access the Supabase authentication token from localStorage:

```javascript
// Get the auth token from localStorage
const getAuthToken = () => {
  const tokenData = localStorage.getItem('sb-okeurgyhsrgcidiqubbe-auth-token');
  if (!tokenData) return null;
  
  try {
    const parsedData = JSON.parse(tokenData);
    return parsedData.access_token;
  } catch (error) {
    console.error('Error parsing auth token:', error);
    return null;
  }
};
```

### Storing Resume Data in Chrome Storage

For better performance and offline access, you should store the resume data in Chrome's storage API. This allows your extension to:

1. Work without an active connection to LinkedAI
2. Provide faster access to resume data
3. Reduce API calls to Supabase

Here's how to implement this:

```javascript
// Store resume data in Chrome storage
const storeResumeData = (userId, resumeData) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ 
      [`resume_${userId}`]: resumeData,
      last_updated: Date.now()
    }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

// Retrieve resume data from Chrome storage
const getStoredResumeData = (userId) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([`resume_${userId}`], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[`resume_${userId}`] || null);
      }
    });
  });
};

// Fetch and store resume data
const fetchAndStoreResumeData = async (userId) => {
  try {
    // Fetch from API
    const resumeData = await fetchUserResume(userId);
    
    // Store in Chrome storage
    await storeResumeData(userId, resumeData);
    
    return resumeData;
  } catch (error) {
    console.error('Error fetching resume data:', error);
    
    // Try to get from storage as fallback
    const storedData = await getStoredResumeData(userId);
    return storedData;
  }
};
```

Update your extension's background script to synchronize resume data:

```javascript
// In background.js
// Add this to your existing code

// Sync resume data periodically
const syncResumeData = async () => {
  if (!authState.isAuthenticated || !authState.token) return;
  
  try {
    // Get user ID from token
    const tokenParts = authState.token.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));
    const userId = payload.sub;
    
    // Fetch latest data and store it
    await fetchAndStoreResumeData(userId);
    console.log('Resume data synchronized with server');
  } catch (error) {
    console.error('Error syncing resume data:', error);
  }
};

// Sync when authentication state changes
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'AUTH_STATE_CHANGED' && request.state === 'SIGNED_IN') {
    syncResumeData();
  }
});

// Also sync periodically (e.g., every hour)
setInterval(syncResumeData, 60 * 60 * 1000);
```

In your content script, prefer local data but fall back to API calls:

```javascript
// In content.js
async function getResumeData() {
  // Get auth token and user info
  const response = await chrome.runtime.sendMessage({action: 'getAuthToken'});
  
  if (!response.token) {
    console.error('Not authenticated with LinkedAI');
    return null;
  }
  
  // Extract user ID from token
  const tokenParts = response.token.split('.');
  const payload = JSON.parse(atob(tokenParts[1]));
  const userId = payload.sub;
  
  // Try to get from Chrome storage first
  try {
    const storedData = await getStoredResumeData(userId);
    if (storedData) {
      // Check if data is recent (less than 24 hours old)
      const lastUpdated = await chrome.storage.local.get(['last_updated']);
      const isRecent = lastUpdated && (Date.now() - lastUpdated.last_updated < 24 * 60 * 60 * 1000);
      
      if (isRecent) {
        console.log('Using cached resume data');
        return storedData;
      }
    }
    
    // If no data or too old, fetch from API and update storage
    console.log('Fetching fresh resume data');
    return await fetchAndStoreResumeData(userId);
  } catch (error) {
    console.error('Error retrieving resume data:', error);
    return null;
  }
}
```

### Permission Requirements

Be sure to add these permissions to your extension's manifest.json:

```json
{
  "permissions": [
    "storage",
    "tabs",
    "https://*.linkedin.com/*",
    "https://okeurgyhsrgcidiqubbe.supabase.co/*"
  ]
}
```

### Making Authenticated Requests

Use the token to make authenticated requests to the Supabase API:

```javascript
// Example: Fetch user's resume data
const fetchUserResume = async (userId) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(
    `https://okeurgyhsrgcidiqubbe.supabase.co/rest/v1/resumes?userId=eq.${userId}&select=*`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': 'YOUR_ANON_KEY', // Include public anon key
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.json();
};
```

### Chrome Extension Implementation

1. Create a background script that handles authentication:

```javascript
// background.js
// Track authentication state
let authState = {
  isAuthenticated: false,
  token: null
};

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAuthToken') {
    // Check if we already have the token in memory
    if (authState.token) {
      sendResponse({token: authState.token});
      return true;
    }
    
    // Otherwise fetch from localStorage in the LinkedAI tab
    chrome.tabs.executeScript(
      {
        code: `
          const tokenData = localStorage.getItem('sb-okeurgyhsrgcidiqubbe-auth-token');
          tokenData;
        `
      },
      (result) => {
        if (result && result[0]) {
          // Parse and store the token
          try {
            const parsedData = JSON.parse(result[0]);
            authState.token = parsedData.access_token;
            authState.isAuthenticated = true;
          } catch (e) {
            console.error('Error parsing token:', e);
          }
        }
        sendResponse({token: authState.token});
      }
    );
    return true; // Required for async sendResponse
  }
  
  // Handle auth state changes
  if (request.action === 'AUTH_STATE_CHANGED') {
    if (request.state === 'SIGNED_IN' && request.token) {
      try {
        const parsed = JSON.parse(request.token);
        authState.token = parsed.access_token;
        authState.isAuthenticated = true;
      } catch (e) {
        console.error('Error parsing token from state change:', e);
      }
    } else if (request.state === 'SIGNED_OUT') {
      authState.token = null;
      authState.isAuthenticated = false;
    }
  }
});

// Listen for storage events to sync auth state across tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'sb-okeurgyhsrgcidiqubbe-auth-token') {
    if (event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        authState.token = parsed.access_token;
        authState.isAuthenticated = true;
        console.log('Auth token updated from another tab');
      } catch (e) {
        console.error('Error parsing token from storage event:', e);
      }
    } else {
      // Token was removed
      authState.token = null;
      authState.isAuthenticated = false;
      console.log('User logged out in another tab');
    }
  }
});
```

2. Create a content script for LinkedIn integration:

```javascript
// content.js
async function injectResumeData() {
  // Get auth token from background script
  const response = await chrome.runtime.sendMessage({action: 'getAuthToken'});
  
  if (!response.token) {
    console.error('Not authenticated with LinkedAI');
    return;
  }
  
  // Now you can use this token to fetch resume data and inject it into LinkedIn messages
  // ...
}

// Run when on LinkedIn messaging page
if (window.location.href.includes('linkedin.com/messaging')) {
  injectResumeData();
}

// Also listen for auth state changes
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'AUTH_STATE_CHANGED') {
    // Refresh the page or update UI based on auth state
    if (request.state === 'SIGNED_IN') {
      console.log('User just signed in, refreshing data...');
      injectResumeData();
    } else if (request.state === 'SIGNED_OUT') {
      console.log('User signed out, updating UI...');
      // Update UI to show not authenticated state
    }
  }
});
```

## Security Considerations

- The Chrome extension should use appropriate permissions to only access necessary data
- Consider implementing scope limitations in your Supabase backend
- Implement proper error handling for authentication failures
- Store sensitive tokens securely and handle token refresh appropriately
- Always validate tokens before using them to ensure they haven't expired

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your Supabase credentials
4. Start the development server: `npm run dev`

## Troubleshooting

- **Authentication Issues:** Check that the localStorage token is accessible and valid
- **CORS Errors:** Ensure your Supabase project has the correct CORS configuration
- **Chrome Extension Permissions:** Verify manifest.json has appropriate permissions
- **Cross-Tab Synchronization:** If auth changes aren't reflected across tabs, verify the storage event listeners are properly set up

### Debugging Chrome Storage

To debug what's currently saved in Chrome storage, add this utility function to your extension:

```javascript
// Utility function to print all Chrome storage contents to console
function printChromeStorage() {
  // Print local storage
  chrome.storage.local.get(null, (items) => {
    console.log('Chrome Local Storage Contents:');
    console.log(items);
    
    // Check for resume data specifically
    const resumeKeys = Object.keys(items).filter(key => key.startsWith('resume_'));
    if (resumeKeys.length > 0) {
      console.log('Found resume data for users:');
      resumeKeys.forEach(key => {
        const userId = key.replace('resume_', '');
        console.log(`- User ID: ${userId}`);
        console.log('  Resume data:', items[key]);
      });
    } else {
      console.log('No resume data found in storage');
    }
    
    // Check last update time
    if (items.last_updated) {
      const lastUpdate = new Date(items.last_updated);
      console.log(`Last updated: ${lastUpdate.toLocaleString()}`);
      console.log(`Age: ${Math.round((Date.now() - items.last_updated) / (1000 * 60))} minutes`);
    }
  });
  
  // Print sync storage too
  chrome.storage.sync.get(null, (items) => {
    console.log('Chrome Sync Storage Contents:');
    console.log(items);
  });
}

// You can call this from the background script or the content script
// Or from the browser's Developer Tools console when inspecting the extension
printChromeStorage();
```

You can run this function:

1. Automatically when your extension starts
2. In response to specific events
3. Manually from the browser's Developer Tools console when inspecting your extension

To run it from the console when debugging your extension:

1. Open your extension's background page by going to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "background page" under your extension
4. In the console that opens, enter `printChromeStorage()`

This will show you exactly what resume data is currently stored in Chrome storage, when it was last updated, and other relevant details.

## License

MIT License
