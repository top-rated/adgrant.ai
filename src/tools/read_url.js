import { tool } from '@langchain/core/tools';


export const readUrlContent = tool(
  async (input) => {
    const response = await fetch(`https://r.jina.ai/${input}`);
    const text = await response.text();
    return text;
  },
  {
    name: 'read_url_content',   
    description: 'Read the content of a URL',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to read',
        },
      },
      required: ['url'],
    },
  }
);
