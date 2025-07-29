import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from 'dotenv'

dotenv.config()

export const googleGemini = () => new ChatGoogleGenerativeAI({
  model: "gemini-pro",
  maxOutputTokens: 2048,
});
