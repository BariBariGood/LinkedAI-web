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
      
      // Add more context to common errors
      if (err.code === '23505') {
        errorMessage = 'A resume with this name already exists.';
      } else if (err.code === 'PGRST301') {
        errorMessage = 'You do not have permission to upload resumes.';
      } else if (err.code === '23503') {
        errorMessage = 'Authentication issue. Please log out and log back in.';
      } else if (err.status === 406) {
        errorMessage = 'Server could not accept the format of the data provided. Please try a different file.';
      } else if (err.message?.includes('storage')) {
        errorMessage = 'Storage error: ' + err.message;
      } else if (err.message?.includes('JSON')) {
        errorMessage = 'Error parsing resume data: ' + err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl w-full">
      <div className="card-body">
        <h2 className="card-title">Upload Your Resume</h2>
        <p className="text-gray-600 mb-4">
          Upload your resume in PDF, DOCX, or TXT format and we'll automatically parse it.
        </p>

        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Select Resume File</span>
          </label>
          <input
            type="file"
            id="resume-upload"
            className="file-input file-input-bordered w-full"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        <div className="card-actions justify-end">
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <span className="loading loading-spinner"></span>
                Uploading...
              </>
            ) : (
              'Upload & Parse Resume'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload; 