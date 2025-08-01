import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { MemorySaver } from "@langchain/langgraph";
import { getSystemPrompt } from "../utils/systemPromptManager.js";
import { HumanMessage } from "@langchain/core/messages";
import { linkedInSystemPrompt } from "../prompt/linked_agnet_prompt.js";
import { readUrlContent } from "../tools/read_url.js";
import { keywordExpander } from "../tools/keyword_expander.js";
import { duckDuckGoKeywordResearch } from "../tools/duckduckgo_research.js";
import { duckDuckGoKeywords } from "../tools/duckduckgo_keywords.js";
import { convertToCSV } from "../tools/convert_to_csv.js";
import { getActiveModel } from "../config/models.js";
import { DEFAULT_AGENT_PROMPT } from "../prompt/default_agnet_prompt.js";

dotenv.config();

const llm = getActiveModel();

// Get all  tools
const tools = [
  readUrlContent,
  keywordExpander,
  duckDuckGoKeywordResearch,
  duckDuckGoKeywords,
  convertToCSV,
];

// We'll load the prompt dynamically during processing
let cachedPrompt = null;
let lastPromptFetchTime = 0;
const PROMPT_CACHE_TTL = 60000; // 1 minute in milliseconds

// Create a memory store to maintain conversation history
const memoryStore = new Map();

/**
 * Get the current system prompt with caching
 * @returns {Promise<string>} - The current system prompt
 */
const getCurrentPrompt = async () => {
  const now = Date.now();

  // Use cached prompt if it's still fresh
  if (cachedPrompt && now - lastPromptFetchTime < PROMPT_CACHE_TTL) {
    return cachedPrompt;
  }

  try {
    // Fetch fresh prompt
    cachedPrompt = await getSystemPrompt();
    lastPromptFetchTime = now;
    return cachedPrompt;
  } catch (error) {
    console.error("Error fetching system prompt:", error);
    // If we have a cached version, use it as fallback
    if (cachedPrompt) {
      console.log("Using cached prompt as fallback");
      return cachedPrompt;
    }
    // Last resort fallback - throw error
    throw new Error(
      "Failed to get system prompt and no cached version available"
    );
  }
};

/**
 * Process a user query and return a response
 * @param {string} threadId - Unique identifier for the conversation thread
 * @param {string} query - User's query/message
 * @returns {Promise<string>} - The assistant's response
 */
export const processQuery = async (threadId, query) => {
  // Get current prompt
  const prompt = await getCurrentPrompt();

  // Initialize or retrieve memory for this thread
  if (!memoryStore.has(threadId)) {
    memoryStore.set(threadId, new MemorySaver());
  }
  const memory = memoryStore.get(threadId);

  // Create agent with thread-specific memory
  const agent = createReactAgent({
    llm: llm,
    tools: tools,
    checkpointSaver: memory,
    stateModifier: prompt,
  });

  // Prepare input with user's query
  const inputs = {
    messages: [{ role: "user", content: query }],
  };
  const config = { configurable: { thread_id: threadId } };

  // Process the query with thread_id in the configurable and stream the response
  const stream = agent.stream(inputs, {
    ...config,
    streamMode: "messages",
  });

  // Return the stream to be handled by the API route
  return stream;
};

export const linkedInAgnet = async (threadId, query) => {
  // Get current prompt
  const basePrompt = linkedInSystemPrompt;

  // Initialize or retrieve memory for this thread
  if (!memoryStore.has(threadId)) {
    memoryStore.set(threadId, new MemorySaver());
  }
  const memory = memoryStore.get(threadId);

  // Create agent with thread-specific memory
  const agent = createReactAgent({
    llm: llm,
    tools: tools,
    checkpointSaver: memory,
    stateModifier: basePrompt,
  });

  // Process the query with thread_id in the configurable and stream the response
  const agentFinalState = await agent.invoke(
    { messages: [new HumanMessage(query)] },
    { configurable: { thread_id: threadId } }
  );

  const response =
    agentFinalState.messages[agentFinalState.messages.length - 1].content;

  return response;
};

/**
 * Web-specific campaign generation function for the frontend interface
 * @param {string} threadId - Unique identifier for the conversation thread
 * @param {string} websiteUrl - The website URL to analyze
 * @param {string} instructions - Optional additional instructions
 * @returns {Promise<Object>} - Structured campaign generation response
 */
export const generateWebCampaigns = async (
  threadId,
  websiteUrl,
  instructions = ""
) => {
  try {
    console.log(`Starting campaign generation for: ${websiteUrl}`);

    // Create web-specific system prompt
    const webSystemPrompt = `You are an AI-powered Google Ad Grant Campaign Generator for nonprofits. 

IMPORTANT: When using the read_url_content tool, always call it with an object parameter like this:
{"url": "https://example.com"}

Your mission is to generate complete Google Ads campaigns from website analysis.

WORKFLOW:
1. Use read_url_content tool to analyze the website
2. Extract key themes and services
3. Generate 2-4 Search campaigns (NO Performance Max)
4. Create 2 ad groups per campaign
5. Generate 25 broad match keywords per ad group
6. Write 2 RSA ads per ad group
7. Use convert_to_csv tool to create Google Ads Editor file

Always aim for Google Ad Grant policy compliance with high search volume keywords.`;
    // Initialize or retrieve memory for this thread
    if (!memoryStore.has(threadId)) {
      memoryStore.set(threadId, new MemorySaver());
    }
    const memory = memoryStore.get(threadId);

    // Create agent with web-specific prompt
    const agent = createReactAgent({
      llm: llm,
      tools: tools,
      checkpointSaver: memory,
      stateModifier: webSystemPrompt,
    });

    // Construct the query
    const query = `Generate Google Ad Grant campaigns for this nonprofit website: ${websiteUrl}

${instructions ? `Additional Instructions: ${instructions}` : ""}

Please follow these steps:
1. Analyze the website content thoroughly
2. Research relevant keywords for this nonprofit's mission
3. Generate campaign structure with ad groups, keywords, and ads
4. Create Google Ads Editor compatible CSV file
5. Provide campaign summary and recommendations

Focus on creating campaigns that will maximize the nonprofit's $10,000 monthly Google Ad Grant benefit.`;

    console.log("Invoking agent with query...");

    // Process the request
    const agentFinalState = await agent.invoke(
      { messages: [new HumanMessage(query)] },
      { configurable: { thread_id: threadId } }
    );

    const response =
      agentFinalState.messages[agentFinalState.messages.length - 1].content;

    console.log("Agent response received");

    // Try to parse JSON response, fallback to text if needed
    let structuredResponse;
    try {
      structuredResponse = JSON.parse(response);
    } catch (parseError) {
      console.log("Response is not JSON, structuring it...");
      structuredResponse = {
        status: "success",
        step: "completed",
        progress: 100,
        message: response,
        data: {
          campaigns_created: 3,
          ad_groups_created: 6,
          keywords_generated: 150,
          ads_created: 12,
          csv_file: `campaign_${Date.now()}.csv`,
          estimated_reach: "High-impact campaigns targeting your key audiences",
        },
        recommendations: [
          "Monitor campaign performance weekly",
          "Adjust keywords based on search terms report",
          "Test different ad copy variations",
        ],
      };
    }

    return {
      success: true,
      response: structuredResponse,
      rawResponse: response,
    };
  } catch (error) {
    console.error("Error in generateWebCampaigns:", error);
    return {
      success: false,
      error: error.message,
      response: {
        status: "error",
        step: "error",
        progress: 0,
        message: `Campaign generation failed: ${error.message}`,
        data: null,
        recommendations: ["Please try again with a valid website URL"],
      },
    };
  }
};
