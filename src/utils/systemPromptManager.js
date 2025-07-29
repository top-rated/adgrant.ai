/**
 * System Prompt Manager
 * Provides utilities to get and update the system prompt
 * Supports updating from admin panel
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_AGENT_PROMPT } from '../prompt/default_agnet_prompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the system prompt JSON file
const SYSTEM_PROMPT_PATH = path.join(__dirname, '../config/system_prompt.json');

/**
 * Gets the current system prompt
 * @returns {Promise<string>} The system prompt
 */
const getSystemPrompt =async () => {
  try {
    // Check if file exists
    if (!fs.existsSync(SYSTEM_PROMPT_PATH)) {
      // Create default prompt if file doesn't exist
      const defaultPrompt = {
        system_prompt: DEFAULT_AGENT_PROMPT
      };
      await fs.promises.writeFile(
        SYSTEM_PROMPT_PATH, 
        JSON.stringify(defaultPrompt, null, 2),
        'utf8'
      );
      return defaultPrompt.system_prompt;
    }

    // Read and parse the file
    const data = await fs.promises.readFile(SYSTEM_PROMPT_PATH, 'utf8');
    const promptData = JSON.parse(data);
    return promptData.system_prompt;
  } catch (error) {
    console.error('Error getting system prompt:', error);
    throw error;
  }
}

/**
 * Updates the system prompt
 * @param {string} newPrompt - The new system prompt
 * @returns {Promise<boolean>} Success status
 */
const updateSystemPrompt = async (newPrompt) => {
  try {
    const promptData = { system_prompt: newPrompt };
    await fs.promises.writeFile(
      SYSTEM_PROMPT_PATH, 
      JSON.stringify(promptData, null, 2),
      'utf8'
    );
    return true;
  } catch (error) {
    console.error('Error updating system prompt:', error);
    throw error;
  }
}

export {
  getSystemPrompt,
  updateSystemPrompt
};
