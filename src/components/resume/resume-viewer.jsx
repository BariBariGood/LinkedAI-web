import { useState, useEffect } from 'react';
import { getResumeFileUrl } from '../../lib/resume-service';

function ResumeViewer({ resumeData }) {
  const [fileUrl, setFileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResumeFile = async () => {
      if (!resumeData?.file_url) {
        console.log('No file URL found in resume data');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log('Loading resume file with URL:', resumeData.file_url);

        // For txt files, we could use the stored URL directly, but for consistency
        // we'll always get a fresh signed URL
        try {
          // Get the file path - it should be just the path without query params
          const filePath = resumeData.file_url.split('?')[0];
          
          // For storage paths, they should be in the format 'user-id/filename'
          // If we need to extract just the last parts of the path:
          const pathParts = filePath.split('/');
          const lastParts = pathParts.length > 2 
            ? pathParts.slice(-2).join('/') // Get just the user-id/filename part
            : filePath;
            
          console.log('Getting signed URL for path:', lastParts);
          const url = await getResumeFileUrl(lastParts);
          console.log('Received signed URL');
          setFileUrl(url);
        } catch (err) {
          console.error('Error getting signed URL:', err);
          // Fallback: Try to use the stored URL directly
          console.log('Falling back to stored URL');
          setFileUrl(resumeData.file_url);
        }
      } catch (err) {
        console.error('Error loading resume file:', err);
        setError(err.message || 'Failed to load resume file');
      } finally {
        setIsLoading(false);
      }
    };

    loadResumeFile();
  }, [resumeData]);

  if (!resumeData) {
    return null;
  }

  return (
    <div className="card bg-base-100 shadow-xl w-full">
      <div className="card-body">
        <h2 className="card-title">Your Resume</h2>
        <p className="text-gray-600 mb-4">
          {resumeData.filename}
        </p>

        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="bg-base-200 rounded-lg p-4 overflow-hidden">
            {fileUrl ? (
              resumeData.file_type === 'application/pdf' ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-96 border-0"
                  title="Resume Preview"
                />
              ) : resumeData.file_type === 'text/plain' ? (
                <div className="font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96">
                  {resumeData.parsed_data?.rawText || 'No text content available'}
                </div>
              ) : (
                <div className="text-center p-4">
                  <p>Preview not available for this file type.</p>
                  <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm mt-2"
                  >
                    Download Resume
                  </a>
                </div>
              )
            ) : (
              <div className="text-center p-4">
                <p>Unable to load resume file preview.</p>
                {resumeData.parsed_data?.rawText && (
                  <div className="mt-4 p-4 bg-base-300 rounded overflow-auto max-h-64">
                    <p className="font-mono text-sm whitespace-pre-wrap">
                      {resumeData.parsed_data.rawText.substring(0, 300)}
                      {resumeData.parsed_data.rawText.length > 300 ? '...' : ''}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeViewer; 