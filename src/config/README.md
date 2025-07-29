# Dynamic Model Selection Configuration

This configuration system allows you to dynamically select and switch between different AI models (Azure OpenAI and Google Gemini) at runtime.

## Files Overview

- `models.js` - Main configuration file with dynamic model selection functions
- `providers.json` - JSON configuration file defining available models
- `../models/azure_openai.js` - Azure OpenAI model instance
- `../models/google_gemini.js` - Google Gemini model instance
- `example-usage.js` - Examples of how to use the dynamic selection

## Configuration Structure

### providers.json
```json
{
  "providers": [
    {
      "name": "azure",
      "model": "gpt-4o",
      "maxTokens": 4096,
      "temperature": 0.7,
      "active": true
    },
    {
      "name": "google",
      "model": "gemini-pro",
      "maxTokens": 4096,
      "temperature": 0.7,
      "active": false
    }
  ]
}
```

## Available Functions

### Core Functions

#### `getActiveModel()`
Returns the currently active model instance.
```javascript
import { getActiveModel } from './config/models.js';

const model = getActiveModel();
```

#### `getModelByName(modelName)`
Returns a specific model instance by name.
```javascript
import { getModelByName } from './config/models.js';

const azureModel = getModelByName('azure');
const googleModel = getModelByName('google');
```

#### `getAvailableModels()`
Returns an array of all available models with their configurations.
```javascript
import { getAvailableModels } from './config/models.js';

const models = getAvailableModels();
models.forEach(model => {
  console.log(`${model.name}: ${model.model} (Active: ${model.active})`);
});
```

#### `setActiveModel(modelName)`
Switches the active model and updates the configuration file.
```javascript
import { setActiveModel } from './config/models.js';

// Switch to Google Gemini
setActiveModel('google');

// Switch to Azure OpenAI
setActiveModel('azure');
```

### Legacy Support

#### `llm`
Backward-compatible export that provides the currently active model.
```javascript
import { llm } from './config/models.js';

// Use the active model directly
const response = await llm.invoke("Hello, world!");
```

#### `activeModels`
Array of currently active models (for backward compatibility).
```javascript
import { activeModels } from './config/models.js';

console.log(activeModels[0]); // First active model
```

## Usage Examples

### Basic Usage
```javascript
import { getActiveModel, setActiveModel } from './config/models.js';

// Get current model
const currentModel = getActiveModel();

// Switch to a different model
setActiveModel('google');

// Use the new model
const newModel = getActiveModel();
const response = await newModel.invoke("Generate a creative story");
```

### Task-Based Model Selection
```javascript
import { getModelByName, getAvailableModels } from './config/models.js';

function selectModelForTask(taskType) {
  const models = getAvailableModels();
  
  switch (taskType) {
    case 'creative':
      return getModelByName('google'); // Use Gemini for creative tasks
    case 'analytical':
      return getModelByName('azure');  // Use GPT for analytical tasks
    default:
      return getActiveModel();
  }
}

// Use different models for different tasks
const creativeModel = selectModelForTask('creative');
const analyticalModel = selectModelForTask('analytical');
```

### Environment Configuration

Make sure you have the required environment variables set:

#### For Azure OpenAI:
```env
MODEL_NAME=gpt-4o
AZURE_OPENAI_API_KEY=your_azure_api_key
AZURE_OPENAI_API_INSTANCE_NAME=your_instance_name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

#### For Google Gemini:
```env
GOOGLE_API_KEY=your_google_api_key
```

## Error Handling

The system includes comprehensive error handling:

```javascript
try {
  const model = getModelByName('nonexistent');
} catch (error) {
  console.error('Model not found:', error.message);
}

try {
  const activeModel = getActiveModel();
} catch (error) {
  console.error('No active models configured:', error.message);
}
```

## Adding New Models

1. Create a new model file in `../models/` directory
2. Add the model configuration to `providers.json`
3. Import and add the model to the `modelsMap` in `models.js`

Example:
```javascript
// In models.js
import { newModel } from "../models/new_model.js";

const modelsMap = {
  "azure": azureOpenAI,
  "google": googleGemini,
  "new": newModel, // Add your new model
}
```

```json
// In providers.json
{
  "providers": [
    // ... existing providers
    {
      "name": "new",
      "model": "new-model-name",
      "maxTokens": 4096,
      "temperature": 0.7,
      "active": false
    }
  ]
}
```

## Migration from Static Configuration

If you're migrating from a static configuration:

1. Replace direct imports of model instances with the dynamic functions
2. Use `getActiveModel()` instead of hardcoded model references
3. Update your code to handle potential model switching

### Before:
```javascript
import { azureOpenAI } from '../models/azure_openai.js';

const response = await azureOpenAI.invoke("Hello");
```

### After:
```javascript
import { getActiveModel } from '../config/models.js';

const model = getActiveModel();
const response = await model.invoke("Hello");
```