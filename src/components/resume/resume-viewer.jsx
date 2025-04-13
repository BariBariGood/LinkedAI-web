import { useState, useEffect } from 'react';
import { getResumeFileUrl } from '../../lib/resume-service';

function ResumeViewer({ resumeData, onNewUpload }) {
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

        try {
          // Get the file path - it should be just the path without query params
          const filePath = resumeData.file_url.split('?')[0];
          
          // For storage paths, they should be in the format 'user-id/filename'
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

  const handleNewUpload = () => {
    if (onNewUpload) onNewUpload();
    else window.location.reload();
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-baseline">
            <h2 className="text-2xl font-bold text-blue-600 mr-2">Your Resume</h2>
            <p className="text-sm text-gray-500 truncate max-w-xs">{resumeData.filename}</p>
          </div>
          <button
            onClick={handleNewUpload}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors w-32"
          >
            New Upload
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-96 bg-gray-100 rounded-lg">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg h-96 overflow-hidden">
            {fileUrl ? (
              resumeData.file_type === 'application/pdf' ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-full border-0"
                  title="Resume Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <p className="text-gray-700 mb-4">Preview not available for this file type.</p>
                  <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Download Resume
                  </a>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <p className="text-gray-700 mb-4">No preview available for this file.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeViewer; 