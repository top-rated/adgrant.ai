import { tool } from '@langchain/core/tools';

/**
 * Tool to fetch related topics and autocomplete suggestions from DuckDuckGo
 * Uses DuckDuckGo's free instant answers API and autocomplete API
 */
export const duckDuckGoKeywords = tool(
  async (input) => {
    const { query, maxSuggestions = 10 } = input;
    const results = {
      query: query,
      relatedTopics: [],
      autocompleteSuggestions: [],
      keywords: []
    };

    try {
      // Fetch instant answers (related topics)
      const instantAnswersUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const instantResponse = await fetch(instantAnswersUrl);
      const instantData = await instantResponse.json();

      // Extract related topics
      if (instantData.RelatedTopics && instantData.RelatedTopics.length > 0) {
        results.relatedTopics = instantData.RelatedTopics
          .slice(0, maxSuggestions)
          .map(topic => {
            if (typeof topic === 'object' && topic.Text) {
              return {
                text: topic.Text,
                url: topic.FirstURL || null
              };
            }
            return null;
          })
          .filter(Boolean);
      }

      // Fetch autocomplete suggestions
      const autocompleteUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`;
      const autocompleteResponse = await fetch(autocompleteUrl);
      const autocompleteData = await autocompleteResponse.json();

      // Extract autocomplete suggestions
      if (Array.isArray(autocompleteData) && autocompleteData.length > 1) {
        results.autocompleteSuggestions = autocompleteData[1]
          .slice(0, maxSuggestions)
          .map(suggestion => ({
            phrase: suggestion,
            relevance: 'high' // DuckDuckGo suggestions are generally relevant
          }));
      }

      // Generate keyword variations from both sources
      const allKeywords = new Set();
      
      // Add original query
      allKeywords.add(query.toLowerCase());
      
      // Extract keywords from related topics
      results.relatedTopics.forEach(topic => {
        if (topic.text) {
          // Extract meaningful words (filter out common words)
          const words = topic.text.toLowerCase()
            .replace(/[^a-z0-9\s]/gi, ' ')
            .split(/\s+/)
            .filter(word => 
              word.length > 2 && 
              !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'man', 'end', 'few', 'got', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
            );
          words.forEach(word => allKeywords.add(word));
        }
      });
      
      // Add autocomplete suggestions as keywords
      results.autocompleteSuggestions.forEach(suggestion => {
        allKeywords.add(suggestion.phrase.toLowerCase());
        // Also add individual words from multi-word suggestions
        const words = suggestion.phrase.toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 2);
        words.forEach(word => allKeywords.add(word));
      });

      results.keywords = Array.from(allKeywords)
        .slice(0, maxSuggestions * 2) // Return more keywords than suggestions
        .map(keyword => ({
          keyword: keyword,
          source: 'duckduckgo',
          relevance: keyword === query.toLowerCase() ? 'primary' : 'secondary'
        }));

    } catch (error) {
      console.error('Error fetching DuckDuckGo data:', error);
      return {
        ...results,
        error: error.message
      };
    }

    return results;
  },
  {
    name: 'duckduckgo_keywords',
    description: 'Fetch related topics, autocomplete suggestions, and generate keywords using DuckDuckGo free APIs',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to get related topics and suggestions for',
        },
        maxSuggestions: {
          type: 'number',
          description: 'Maximum number of suggestions to return (default: 10)',
          default: 10
        }
      },
      required: ['query'],
    },
  }
);