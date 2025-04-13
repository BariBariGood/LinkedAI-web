import { supabase } from './supabase';

/**
 * Get all templates for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of templates
 */
export const getTemplates = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTemplates:', error);
    throw error;
  }
};

/**
 * Create a new template
 * @param {Object} templateData - The template data
 * @param {string} templateData.user_id - The user ID
 * @param {string} templateData.title - The template title
 * @param {string} templateData.content - The template content
 * @returns {Promise<Object>} - The created template
 */
export const createTemplate = async (templateData) => {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createTemplate:', error);
    throw error;
  }
};

/**
 * Update an existing template
 * @param {string} templateId - The template ID
 * @param {Object} templateData - The template data
 * @param {string} templateData.title - The template title
 * @param {string} templateData.content - The template content
 * @returns {Promise<Object>} - The updated template
 */
export const updateTemplate = async (templateId, templateData) => {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .update({ 
        ...templateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateTemplate:', error);
    throw error;
  }
};

/**
 * Delete a template
 * @param {string} templateId - The template ID
 * @returns {Promise<void>}
 */
export const deleteTemplate = async (templateId) => {
  try {
    const { error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteTemplate:', error);
    throw error;
  }
};

/**
 * Get a specific template by ID
 * @param {string} templateId - The template ID
 * @returns {Promise<Object>} - The template
 */
export const getTemplateById = async (templateId) => {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getTemplateById:', error);
    throw error;
  }
}; 