import { AzureChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();


const azureConfig = {
  model: process.env.MODEL_NAME,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
  azureOpenAIApiDeploymentName: process.env.MODEL_NAME,
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
};

export const azureOpenAI = () => new AzureChatOpenAI(azureConfig);





