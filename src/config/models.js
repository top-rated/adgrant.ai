import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {azureOpenAI} from "../models/azure_openai.js";
import {googleGemini} from "../models/google_gemini.js";

// Get file path for JSON config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modelsPath = path.join(__dirname, 'providers.json');

// Read and parse providers configuration
const modelsData = fs.readFileSync(modelsPath, 'utf8');
const models = JSON.parse(modelsData);

// Map provider names to their model instances
const modelsMap = {
  "azure": azureOpenAI,
  "google": googleGemini,
}

// Get active models from configuration
const activeModels = models.providers.filter(model => model.active);

// Get the primary active model instance
const getActiveModel = () => {
  if (activeModels.length === 0) {
    throw new Error('No active models configured in providers.json');
  }
  return modelsMap[activeModels[0].name]();
};

// Get model by name (for dynamic selection)
const getModelByName = (modelName) => {
  const provider = models.providers.find(p => p.name === modelName);
  if (!provider) {
    throw new Error(`Model ${modelName} not found in providers.json`);
  }
  if (!provider.active) {
    console.warn(`Warning: Model ${modelName} is not marked as active`);
  }
  return modelsMap[modelName]();
};

// Get all available model names
const getAvailableModels = () => {
  return models.providers.map(provider => ({
    name: provider.name,
    model: provider.model,
    active: provider.active,
    maxTokens: provider.maxTokens,
    temperature: provider.temperature
  }));
};

// Set a model as active (updates the JSON file)
const setActiveModel = (modelName) => {
  const updatedProviders = models.providers.map(provider => ({
    ...provider,
    active: provider.name === modelName
  }));
  
  const updatedConfig = {
    providers: updatedProviders
  };
  
  fs.writeFileSync(modelsPath, JSON.stringify(updatedConfig, null, 2));
  
  // Update in-memory configuration
  models.providers = updatedProviders;
  activeModels.length = 0;
  activeModels.push(...updatedProviders.filter(model => model.active));
  
  console.log(`Active model switched to: ${modelName}`);
};

// Default LLM instance (backward compatibility)
const llm = getActiveModel;

console.log(`Active model: ${activeModels[0]?.model || 'None'}`);

// Default export (for backward compatibility)
export default getActiveModel;

export { 
  activeModels, 
  llm, 
  getActiveModel, 
  getModelByName, 
  getAvailableModels, 
  setActiveModel,
  modelsMap 
}
