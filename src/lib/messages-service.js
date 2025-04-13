import { supabase } from './supabase';

/**
 * Get all generated messages for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of messages
 */
export const getGeneratedMessages = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('generated_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getGeneratedMessages:', error);
    throw error;
  }
};

/**
 * Create a new generated message
 * @param {Object} messageData - The message data
 * @param {string} messageData.user_id - The user ID
 * @param {string} messageData.recipient_name - Name of the recipient
 * @param {string} messageData.recipient_linkedin_url - LinkedIn URL of the recipient
 * @param {string} messageData.message_text - The generated message text
 * @param {string} messageData.template_id - Optional template ID used
 * @returns {Promise<Object>} - The created message
 */
export const createGeneratedMessage = async (messageData) => {
  try {
    const { data, error } = await supabase
      .from('generated_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createGeneratedMessage:', error);
    throw error;
  }
};

/**
 * Delete a generated message
 * @param {string} messageId - The message ID
 * @returns {Promise<void>}
 */
export const deleteGeneratedMessage = async (messageId) => {
  try {
    const { error } = await supabase
      .from('generated_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteGeneratedMessage:', error);
    throw error;
  }
};

/**
 * Get a specific message by ID
 * @param {string} messageId - The message ID
 * @returns {Promise<Object>} - The message
 */
export const getMessageById = async (messageId) => {
  try {
    const { data, error } = await supabase
      .from('generated_messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (error) {
      console.error('Error fetching message:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getMessageById:', error);
    throw error;
  }
}; 