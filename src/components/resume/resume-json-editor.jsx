import { useState, useEffect } from 'react';
import { updateResumeData } from '../../lib/resume-service';

function ResumeJsonEditor({ resumeData, onUpdate }) {
  const [jsonString, setJsonString] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (resumeData?.parsed_data) {
      setJsonString(JSON.stringify(resumeData.parsed_data, null, 2));
    }
  }, [resumeData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setJsonString(JSON.stringify(resumeData.parsed_data, null, 2));
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Validate JSON
      const parsedJson = JSON.parse(jsonString);
      
      // Update in database
      const updatedResume = await updateResumeData(resumeData.id, parsedJson);
      
      // Notify parent component
      onUpdate(updatedResume);
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving JSON:', err);
      setError(err.message || 'Invalid JSON format');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setJsonString(e.target.value);
  };

  if (!resumeData) {
    return null;
  }

  return (
    <div className="card bg-base-100 shadow-xl w-full">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Parsed Resume Data</h2>
          {!isEditing ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleEdit}
            >
              Edit JSON
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <div className="form-control mb-2">
          {isEditing ? (
            <textarea
              className="textarea textarea-bordered font-mono text-sm h-96"
              value={jsonString}
              onChange={handleChange}
              disabled={isSaving}
            />
          ) : (
            <div className="bg-base-200 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                {jsonString}
              </pre>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 mt-2">
          <p>
            You can edit the JSON data above to correct or update any information that wasn't properly parsed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResumeJsonEditor; 