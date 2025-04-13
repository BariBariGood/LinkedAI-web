import { supabase } from './supabase';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;

/**
 * Upload a resume file to Supabase storage
 */
export const uploadResumeFile = async (file, userId) => {
  console.log('Starting file upload:', { fileName: file.name, fileType: file.type, fileSize: file.size, userId });
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  console.log('Uploading file to Supabase storage:', { filePath, fileName });
  
  try {
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw error;
    }
    
    console.log('File upload successful:', data);
    return { filePath, fileName };
  } catch (error) {
    console.error('Error in uploadResumeFile:', error);
    throw error;
  }
};

/**
 * Simple resume parser - extracts raw text from PDF files
 */
export const parseResume = async (file) => {
  console.log('Starting resume parsing for file:', { fileName: file.name, fileType: file.type, fileSize: file.size });
  
  try {
    let text = '';
    
    // PDF files can't be parsed as plain text with FileReader
    if (file.type === 'application/pdf') {
      console.log('PDF file detected - using PDF.js to parse content');
      
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      // Extract text from all pages
      const numPages = pdf.numPages;
      const textPromises = [];
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        textPromises.push(pageText);
      }
      
      // Combine text from all pages
      const pageTexts = await Promise.all(textPromises);
      text = pageTexts.join('\n\n');
      
      console.log('Successfully extracted text from PDF');
    } else {
      // For text-based files, use the regular parsing
      console.log('Text-based file detected, attempting to read content');
      text = await readFileAsText(file);
      console.log('Successfully read file as text, length:', text.length);
    }
    
    console.log('Parsing completed successfully');
    return { rawText: text };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
};

/**
 * Save resume data to the database
 */
export const saveResumeData = async (userId, fileName, fileUrl, fileType, parsedData) => {
  console.log('Saving resume data to database:', { userId, fileName, fileType });
  console.log('FileURL structure:', fileUrl);
  console.log('Parsed data to be saved:', parsedData);
  
  try {
    // Ensure the data doesn't exceed Postgres JSONB size limits
    const parsedDataString = JSON.stringify(parsedData);
    console.log('Parsed data string length:', parsedDataString.length);
    
    if (parsedDataString.length > 100000) { // Set a reasonable limit
      console.warn('Parsed data exceeds reasonable size limit, truncating raw text');
      
      // Create a truncated version by limiting rawText
      const truncatedData = {
        ...parsedData,
        rawText: parsedData.rawText?.substring(0, 5000) + '... (truncated due to size limits)'
      };
      
      parsedData = truncatedData;
      console.log('Truncated parsed data length:', JSON.stringify(parsedData).length);
    }
    
    // Ensure the fileUrl is in the correct format
    // Store only the path part for storage URLs, not the full signed URL with tokens
    let storedFileUrl = fileUrl;
    if (fileUrl && fileUrl.includes('?')) {
      // Extract just the path part before any query parameters
      storedFileUrl = fileUrl.split('?')[0];
      console.log('Storing file URL without query parameters:', storedFileUrl);
    }
    
    console.log('Inserting resume data into database');
    
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        filename: fileName,
        file_url: storedFileUrl,
        file_type: fileType,
        parsed_data: parsedData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving resume data to Supabase:', error);
      throw error;
    }

    console.log('Resume data saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in saveResumeData:', error);
    
    // More detailed error handling
    if (error.status === 406) {
      console.warn('Server returned 406 Not Acceptable. Check content negotiation headers.');
      throw new Error('Server could not accept the format of the data provided');
    } else if (error.code === '23505') {
      throw new Error('A resume with this information already exists');
    } else if (error.code === 'PGRST301') {
      throw new Error('You do not have permission to save resume data');
    } else if (error.code === '22P02') {
      throw new Error('Invalid data format. Please check your resume information.');
    }
    
    throw error;
  }
};

/**
 * Get user's most recent resume
 */
export const getUserResume = async (userId) => {
  console.log('Fetching most recent resume for user:', userId);
  
  try {
    // Standard query without additional headers
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PGRST116 means no rows returned
        console.log('No resume found for user:', userId);
        return null;
      }
      console.error('Error fetching user resume:', error);
      throw error;
    }

    console.log('Successfully retrieved resume:', data?.id);
    return data;
  } catch (error) {
    console.error('Error in getUserResume:', error);
    
    // Don't throw the error, instead return null and log the issue
    // This prevents the app from crashing when there's a data access issue
    if (error.status === 406) {
      console.warn('Server returned 406 Not Acceptable. Check content negotiation headers.');
      return null;
    }
    
    throw error;
  }
};

/**
 * Update resume parsed data
 */
export const updateResumeData = async (resumeId, parsedData) => {
  console.log('Updating resume parsed data:', { resumeId });
  
  try {
    // Ensure data size is reasonable
    const parsedDataString = JSON.stringify(parsedData);
    console.log('Parsed data string length:', parsedDataString.length);
    
    if (parsedDataString.length > 100000) { // Set a reasonable limit
      console.warn('Parsed data exceeds reasonable size limit, truncating raw text');
      
      // Create a truncated version by limiting rawText
      const truncatedData = {
        ...parsedData,
        rawText: parsedData.rawText?.substring(0, 5000) + '... (truncated due to size limits)'
      };
      
      parsedData = truncatedData;
      console.log('Truncated parsed data length:', JSON.stringify(parsedData).length);
    }
    
    const { data, error } = await supabase
      .from('resumes')
      .update({ 
        parsed_data: parsedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', resumeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating resume data:', error);
      throw error;
    }

    console.log('Resume data updated successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('Error in updateResumeData:', error);
    
    // More detailed error handling
    if (error.status === 406) {
      console.warn('Server returned 406 Not Acceptable. Check content negotiation headers.');
      throw new Error('Server could not accept the format of the data provided');
    } else if (error.code === 'PGRST301') {
      throw new Error('You do not have permission to update this resume');
    } else if (error.code === '22P02') {
      throw new Error('Invalid data format. Please check your resume information.');
    }
    
    throw error;
  }
};

/**
 * Get the URL for a resume file
 */
export const getResumeFileUrl = async (filePath) => {
  console.log('Getting signed URL for file path:', filePath);
  
  try {
    const { data, error } = await supabase.storage
      .from('resumes')
      .createSignedUrl(filePath, 3600); // URL valid for 1 hour

    if (error) {
      console.error('Error creating signed URL:', error);
      throw error;
    }

    console.log('Successfully created signed URL');
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getResumeFileUrl:', error);
    throw error;
  }
};

// Helper functions for parsing
const readFileAsText = (file) => {
  console.log('Reading file as text:', file.name);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      console.log('FileReader onload event triggered');
      resolve(e.target.result);
    };
    
    reader.onerror = (e) => {
      console.error('FileReader error:', e);
      reject(new Error('Failed to read file: ' + e.target.error));
    };
    
    reader.readAsText(file);
    console.log('FileReader.readAsText called');
  });
};

const extractBasicInfo = (text) => {
  console.log('Extracting basic info from text of length:', text.length);
  
  // Very basic logic to extract name, email, phone
  // In a real app, use a more sophisticated approach
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /\b(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;
  
  const email = text.match(emailRegex) ? text.match(emailRegex)[0] : '';
  const phone = text.match(phoneRegex) ? text.match(phoneRegex)[0] : '';
  
  // For name, take the first line that doesn't contain email or phone
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  let name = '';
  for (const line of lines) {
    if (!line.includes('@') && !line.match(phoneRegex)) {
      name = line;
      break;
    }
  }

  const result = {
    name,
    email,
    phone,
    location: '',  // Location is harder to reliably detect without NLP
  };
  
  console.log('Extracted basic info:', result);
  return result;
};

const extractSection = (text, sectionName, nextSectionName) => {
  console.log(`Extracting ${sectionName} section`);
  
  // Look for section headers using common patterns
  const sectionRegex = new RegExp(`\\b${sectionName}\\b`, 'i');
  const nextSectionRegex = nextSectionName 
    ? new RegExp(`\\b${nextSectionName}\\b`, 'i') 
    : null;
  
  let startIndex = text.search(sectionRegex);
  console.log(`${sectionName} section start index:`, startIndex);
  
  if (startIndex === -1) {
    console.log(`${sectionName} section not found in text`);
    return [];
  }
  
  // Find the start of the next section
  let endIndex = nextSectionRegex 
    ? text.search(nextSectionRegex) 
    : text.length;
  
  console.log(`${sectionName} section end index:`, endIndex);
  
  if (endIndex === -1) endIndex = text.length;
  
  // Extract the section text
  const sectionText = text.substring(startIndex, endIndex).trim();
  console.log(`${sectionName} section text length:`, sectionText.length);
  
  let result;
  
  // For education and experience, we'll try to identify entries
  // Each entry likely has dates, organization names, and descriptions
  if (sectionName === 'education') {
    // Simplified for debugging - return placeholder
    result = [{ institution: 'Extracted education information', degree: '', dates: '' }];
  } else if (sectionName === 'experience') {
    // Simplified for debugging - return placeholder
    result = [{ company: 'Extracted experience information', position: '', dates: '', description: '' }];
  } else if (sectionName === 'skills') {
    // For skills, split by commas or new lines
    const skillSection = sectionText.replace(/skills:?/i, '').trim();
    const skills = skillSection.split(/,|\n/).map(skill => skill.trim()).filter(Boolean);
    result = skills;
  } else {
    result = sectionText;
  }
  
  console.log(`Extracted ${sectionName} result:`, result);
  return result;
}; 