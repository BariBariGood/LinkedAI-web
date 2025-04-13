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

  const handleGenerateEmail = () => {
    // This would be connected to an email generation feature
    console.log('Generate email based on resume data');
    alert('Email generation feature would go here');
  };

  if (!resumeData) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-baseline">
            <h2 className="text-2xl font-bold text-blue-600 mr-2">Parsed Resume Data</h2>
            <p className="text-sm text-transparent">placeholder</p>
          </div>
          <button
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors w-32"
            onClick={handleEdit}
          >
            Edit JSON
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {isEditing ? (
          <div>
            <textarea
              className="w-full h-96 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg"
              value={jsonString}
              onChange={handleChange}
              disabled={isSaving}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 font-mono text-sm overflow-auto h-96">
              <pre className="whitespace-pre-wrap text-gray-700">{jsonString}</pre>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                onClick={handleGenerateEmail}
              >
                Generate Email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResumeJsonEditor; 