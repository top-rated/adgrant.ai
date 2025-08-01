import { tool } from "@langchain/core/tools";

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

      console.log(`Reading content from: ${cleanUrl}`);

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

      return {
        success: true,
        url: cleanUrl,
        content: text,
        contentLength: text.length,
        message: `Successfully read ${text.length} characters from ${cleanUrl}`,
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
