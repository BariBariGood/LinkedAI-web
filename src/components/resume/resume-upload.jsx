import { useState } from 'react';
import { uploadResumeFile, parseResume, saveResumeData, getResumeFileUrl } from '../../lib/resume-service';
import { useAuth } from '../../context/auth-context';

function ResumeUpload({ onResumeProcessed }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log('File selected:', { 
        name: selectedFile.name, 
        type: selectedFile.type, 
        size: selectedFile.size 
      });
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      console.log('Starting resume upload process');
      setIsUploading(true);
      setError(null);

      // Check if the user is authenticated
      if (!user?.id) {
        console.error('No authenticated user found');
        throw new Error('You must be logged in to upload a resume. Please refresh and try again.');
      }

      // Upload process (all steps)
      // 1. Parse the resume
      console.log('Step 1: Parse resume');
      let parsedData;
      try {
        parsedData = await parseResume(file);
        console.log('Resume parsing complete, parsed data:', parsedData);
      } catch (parseError) {
        console.error('Error parsing resume:', parseError);
        throw new Error(`Failed to parse resume: ${parseError.message || 'Unknown error'}`);
      }

      // 2. Upload the file to storage
      console.log('Step 2: Upload file to storage');
      console.log('Current user ID:', user.id);
      
      let fileInfo;
      try {
        fileInfo = await uploadResumeFile(file, user.id);
        console.log('File upload complete:', fileInfo);
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message || 'Storage error'}`);
      }

      // 3. Get the file URL
      console.log('Step 3: Get file URL');
      let fileUrl;
      try {
        fileUrl = await getResumeFileUrl(fileInfo.filePath);
        console.log('File URL obtained:', fileUrl);
      } catch (urlError) {
        console.error('Error getting file URL:', urlError);
        // Continue anyway with a null URL - the file is still in storage
        fileUrl = null;
        console.warn('Continuing without a valid file URL');
      }

      // 4. Save the resume data to the database
      console.log('Step 4: Save resume data to database');
      console.log('Data to be saved:', {
        userId: user.id, 
        fileName: fileInfo.fileName, 
        fileUrl,
        fileType: file.type,
        parsedDataSize: JSON.stringify(parsedData).length
      });
      
      let resumeData;
      try {
        resumeData = await saveResumeData(
          user.id, 
          fileInfo.fileName, 
          fileUrl || fileInfo.filePath, // Use filePath as a fallback if URL generation failed
          file.type,
          parsedData
        );
        console.log('Resume data saved successfully:', resumeData);
      } catch (saveError) {
        console.error('Error saving resume data:', saveError);
        throw new Error(`Failed to save resume data: ${saveError.message || 'Database error'}`);
      }

      // 5. Notify parent component of successful upload
      console.log('Step 5: Notify parent component');
      onResumeProcessed(resumeData);
      console.log('Resume upload process completed successfully');
      
      // 6. Reset the file input
      setFile(null);
      const fileInput = document.getElementById('resume-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error('Error uploading resume:', err);
      let errorMessage = err.message || 'Failed to upload resume';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full bg-blue-50 rounded-lg overflow-hidden shadow-md">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 flex-shrink-0 mr-4">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <rect x="4" y="4" width="56" height="56" rx="4" fill="#2563EB" />
              <rect x="44" y="4" width="16" height="16" rx="0 4 0 4" fill="#FBBF24" />
              <line x1="16" y1="24" x2="48" y2="24" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <line x1="16" y1="32" x2="48" y2="32" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <line x1="16" y1="40" x2="48" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <line x1="16" y1="48" x2="36" y2="48" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-800">Resume Parser</h2>
            <p className="text-blue-600">Upload your resume to extract the text</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg p-6 shadow-inner">
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              Upload your resume in PDF, DOCX, or TXT format. Our parser will extract the text content.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Resume File
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mb-1 text-sm text-blue-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-blue-500">PDF, DOCX, or TXT files</p>
                </div>
                <input 
                  id="resume-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            </div>
            {file && (
              <div className="mt-3 text-sm text-gray-600">
                Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Parse Resume'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload; 