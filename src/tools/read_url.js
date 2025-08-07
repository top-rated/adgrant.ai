import { tool } from "@langchain/core/tools";

/**
 * Analyze website content to extract key information for campaign generation
 * @param {string} content - Raw website content
 * @param {string} url - Website URL
 * @returns {Object} - Structured analysis results
 */
function analyzeWebsiteContent(content, url) {
  const analysis = {
    organizationName: extractOrganizationName(content, url),
    mission: extractMission(content),
    services: extractServices(content),
    targetAudience: extractTargetAudience(content),
    location: extractLocation(content),
    keyMessages: extractKeyMessages(content),
    callsToAction: extractCallsToAction(content),
    keywords: extractKeywords(content),
  };

  return analysis;
}

/**
 * Extract organization name from content and URL
 */
function extractOrganizationName(content, url) {
  // Try to extract from title, headers, or domain
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const domainMatch = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);

  let orgName = "";

  if (titleMatch) {
    orgName = titleMatch[1].replace(/\s*[-|]\s*.*/, "").trim();
  } else if (h1Match) {
    orgName = h1Match[1].trim();
  } else if (domainMatch) {
    orgName = domainMatch[1].replace(/\.[a-z]+$/, "").replace(/[-_]/g, " ");
  }

  return orgName || "Organization";
}

/**
 * Extract mission statement patterns
 */
function extractMission(content) {
  const missionPatterns = [
    /(?:our mission|mission statement|we believe|our purpose|our vision|our goal)[^.!?]*[.!?]/gi,
    /(?:dedicated to|committed to|working to|striving to)[^.!?]*[.!?]/gi,
  ];

  const missions = [];
  missionPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) missions.push(...matches);
  });

  return missions.slice(0, 3).map((m) => m.trim());
}

/**
 * Extract services and programs
 */
function extractServices(content) {
  const servicePatterns = [
    /(?:services|programs|offerings|initiatives|projects)[^.!?]*[.!?]/gi,
    /(?:we provide|we offer|we deliver|we help with)[^.!?]*[.!?]/gi,
  ];

  const services = [];
  servicePatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) services.push(...matches);
  });

  return services.slice(0, 5).map((s) => s.trim());
}

/**
 * Extract target audience information
 */
function extractTargetAudience(content) {
  const audiencePatterns = [
    /(?:for|helping|serving|supporting)\s+(?:children|adults|seniors|families|students|veterans|homeless|disabled|women|men|youth|elderly)/gi,
    /(?:target|serve|help|support|assist)\s+[^.!?]*(?:community|population|group|individuals)[^.!?]*[.!?]/gi,
  ];

  const audiences = [];
  audiencePatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) audiences.push(...matches);
  });

  return audiences.slice(0, 3).map((a) => a.trim());
}

/**
 * Extract location and geographic focus
 */
function extractLocation(content) {
  const locationPatterns = [
    /(?:located in|based in|serving|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2})?)/g,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})\b/g,
  ];

  const locations = [];
  locationPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) locations.push(...matches);
  });

  return [...new Set(locations)].slice(0, 3);
}

/**
 * Extract key messaging and value propositions
 */
function extractKeyMessages(content) {
  const messagePatterns = [
    /(?:why choose us|what makes us different|our impact|our approach)[^.!?]*[.!?]/gi,
    /(?:we are|we're)\s+(?:the\s+)?(?:leading|premier|top|best|only)[^.!?]*[.!?]/gi,
  ];

  const messages = [];
  messagePatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) messages.push(...matches);
  });

  return messages.slice(0, 3).map((m) => m.trim());
}

/**
 * Extract calls to action
 */
function extractCallsToAction(content) {
  const ctaPatterns = [
    /(?:donate|volunteer|contact|join|help|support|get involved|make a difference|take action)[^.!?]*[.!?]/gi,
  ];

  const ctas = [];
  ctaPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) ctas.push(...matches);
  });

  return ctas.slice(0, 5).map((c) => c.trim());
}

/**
 * Extract potential keywords from content
 */
function extractKeywords(content) {
  // Remove HTML tags and extract meaningful words
  const cleanText = content.replace(/<[^>]*>/g, " ").toLowerCase();
  const words = cleanText.match(/\b[a-z]{3,}\b/g) || [];

  // Count word frequency
  const wordCount = {};
  words.forEach((word) => {
    if (word.length >= 3) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });

  // Get top keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
}

export const readUrlContent = tool(
  async (input) => {
    try {
      // Handle both string input and object input
      const url = typeof input === "string" ? input : input.url;
      if (!url) {
        throw new Error("URL is required");
      }

      // Clean the URL to ensure it's properly formatted
      const cleanUrl = url.startsWith("http") ? url : `https://${url}`;

      console.log(`🌐 Scraping website content from: ${cleanUrl}`);

      const response = await fetch(`https://r.jina.ai/${cleanUrl}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch URL: ${response.status} ${response.statusText}`
        );
      }

      const text = await response.text();

      if (!text || text.trim().length === 0) {
        throw new Error("No content retrieved from URL");
      }

      // Enhanced content analysis and structuring
      const analysisResult = analyzeWebsiteContent(text, cleanUrl);

      return {
        success: true,
        url: cleanUrl,
        content: text,
        contentLength: text.length,
        analysis: analysisResult,
        message: `Successfully analyzed ${text.length} characters from ${cleanUrl}`,
        structuredData: {
          organizationName: analysisResult.organizationName,
          mission: analysisResult.mission,
          services: analysisResult.services,
          targetAudience: analysisResult.targetAudience,
          location: analysisResult.location,
          keyMessages: analysisResult.keyMessages,
          callsToAction: analysisResult.callsToAction,
        },
      };
    } catch (error) {
      console.error("Error reading URL:", error);
      return {
        success: false,
        error: error.message,
        message: `Failed to read content from URL: ${error.message}`,
      };
    }
  },
  {
    name: "read_url_content",
    description:
      "Read and analyze the content of a website URL. Returns structured content data for campaign generation.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description:
            "The complete URL to read and analyze (e.g., https://example.com)",
        },
      },
      required: ["url"],
    },
  }
);
