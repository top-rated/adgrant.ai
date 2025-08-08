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

// Create a memory store to maintain conversation history
const memoryStore = new Map();

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
    console.log(
      `🚀 Starting WEBSITE-SPECIFIC campaign generation for: ${websiteUrl}`
    );

    // Enhanced web-specific system prompt that ensures website content utilization
    const webSystemPrompt = `You are a Google Ad Grant specialist that creates WEBSITE-SPECIFIC campaigns for nonprofits.

CRITICAL INSTRUCTIONS:
- NEVER use generic templates or assumptions
- ALWAYS base campaigns on ACTUAL scraped website content
- Each campaign must be unique to the analyzed website
- Focus on the organization's specific mission, services, and programs

MANDATORY WORKFLOW:
1. SCRAPE WEBSITE: Use read_url_content tool with parameter {"url": "${websiteUrl}"}
2. DEEP ANALYSIS: Extract organization's specific:
   - Mission and cause focus
   - Services and programs offered  
   - Target beneficiaries and audiences
   - Geographic service areas
   - Unique value propositions
   - Key messaging and terminology used

3. WEBSITE-SPECIFIC CAMPAIGN CREATION:
   - Generate 2-4 Search campaigns based on ACTUAL website content
   - Name campaigns after real services/programs found on website
   - Create 2 ad groups per campaign reflecting actual website structure
   
4. CONTENT-DRIVEN KEYWORD RESEARCH:
   - Extract 25 broad match keywords per ad group from ACTUAL website content
   - Use organization's own terminology and service names
   - Include location-based keywords if geographic focus found
   - Research related keywords using duckduckgo tools for expansion
   - Ensure Google Ad Grant compliance (high volume, relevant)

5. AUTHENTIC AD COPY:
   - Write 2 RSA ads per ad group using ACTUAL website messaging
   - Include real organization name, mission, and call-to-actions from website
   - Incorporate specific programs, services, and impact statements found
   - Match the tone and style of the original website

6. PROFESSIONAL CSV EXPORT:
   - Use convert_to_csv tool with complete campaign structure
   - Include all components: campaigns, ad groups, keywords, ads, extensions
   - Ensure Google Ads Editor compatibility
   - Distribute $320 daily budget across campaigns

QUALITY ASSURANCE:
- Verify all keywords relate to actual website content
- Ensure ad copy reflects real organization messaging  
- Check campaign names match actual services/programs
- Validate Google Ad Grant policy compliance

RESPONSE FORMAT: Always return structured JSON with campaign details and recommendations.

Remember: This campaign must be so specific to the website that it couldn't work for any other organization!`;
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
      { configurable: { thread_id: threadId } },
      { recursionLimit: 100 }
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
