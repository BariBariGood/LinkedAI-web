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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAuthToken') {
    // This runs in the context of the LinkedAI web application
    chrome.tabs.executeScript(
      {
        code: `
          const tokenData = localStorage.getItem('sb-okeurgyhsrgcidiqubbe-auth-token');
          tokenData;
        `
      },
      (result) => {
        sendResponse({token: result[0]});
      }
    );
    return true; // Required for async sendResponse
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
```

## Security Considerations

- The Chrome extension should use appropriate permissions to only access necessary data
- Consider implementing scope limitations in your Supabase backend
- Implement proper error handling for authentication failures
- Store sensitive tokens securely and handle token refresh appropriately

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your Supabase credentials
4. Start the development server: `npm run dev`

## Troubleshooting

- **Authentication Issues:** Check that the localStorage token is accessible and valid
- **CORS Errors:** Ensure your Supabase project has the correct CORS configuration
- **Chrome Extension Permissions:** Verify manifest.json has appropriate permissions

## License

MIT License
