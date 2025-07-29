import { tool } from '@langchain/core/tools';

/**
 * Tool to expand keywords into related topics and generate keyword clusters
 * Uses multiple variations and semantic grouping for comprehensive keyword research
 */
export const keywordExpander = tool(
  async (input) => {
    const { baseKeyword, expansionTypes = ['semantic', 'questions', 'modifiers'], maxResults = 20 } = input;
    
    const results = {
      baseKeyword: baseKeyword,
      expandedKeywords: [],
      keywordClusters: {},
      searchQueries: []
    };

    try {
      // Common keyword modifiers and question words
      const modifierWords = {
        semantic: ['best', 'top', 'free', 'online', 'cheap', 'premium', 'professional', 'advanced', 'basic', 'simple'],
        questions: ['how to', 'what is', 'where to', 'when to', 'why', 'which', 'who', 'can I', 'should I', 'will'],
        commercial: ['buy', 'purchase', 'price', 'cost', 'discount', 'deal', 'review', 'compare', 'vs', 'alternative'],
        informational: ['guide', 'tutorial', 'tips', 'tricks', 'examples', 'benefits', 'features', 'pros and cons'],
        local: ['near me', 'local', 'in my area', 'nearby', 'location', 'address', 'hours', 'contact']
      };

      // Generate keyword variations based on expansion types
      const allVariations = new Set();
      
      expansionTypes.forEach(type => {
        if (modifierWords[type]) {
          modifierWords[type].forEach(modifier => {
            // Add modifier before keyword
            allVariations.add(`${modifier} ${baseKeyword}`);
            // Add modifier after keyword
            allVariations.add(`${baseKeyword} ${modifier}`);
          });
        }
      });

      // Fetch autocomplete suggestions for expanded keywords
      const keywordPromises = Array.from(allVariations).slice(0, 10).map(async (variation) => {
        try {
          const autocompleteUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(variation)}&type=list`;
          const response = await fetch(autocompleteUrl);
          const data = await response.json();
          
          if (Array.isArray(data) && data.length > 1) {
            return data[1].slice(0, 5).map(suggestion => ({
              keyword: suggestion,
              baseVariation: variation,
              type: 'autocomplete',
              searchVolume: 'unknown' // DuckDuckGo doesn't provide volume data
            }));
          }
          return [];
        } catch (error) {
          console.error(`Error fetching suggestions for ${variation}:`, error);
          return [];
        }
      });

      const suggestionResults = await Promise.all(keywordPromises);
      const allSuggestions = suggestionResults.flat();

      // Combine original variations with autocomplete suggestions
      Array.from(allVariations).forEach(variation => {
        results.expandedKeywords.push({
          keyword: variation,
          baseVariation: baseKeyword,
          type: 'generated',
          searchVolume: 'unknown'
        });
      });

      results.expandedKeywords.push(...allSuggestions);

      // Remove duplicates and limit results
      const uniqueKeywords = results.expandedKeywords
        .filter((item, index, self) => 
          index === self.findIndex(t => t.keyword.toLowerCase() === item.keyword.toLowerCase())
        )
        .slice(0, maxResults);

      results.expandedKeywords = uniqueKeywords;

      // Create keyword clusters by intent/type
      results.keywordClusters = {
        informational: uniqueKeywords.filter(k => 
          k.keyword.includes('how to') || k.keyword.includes('what is') || 
          k.keyword.includes('guide') || k.keyword.includes('tutorial')
        ),
        commercial: uniqueKeywords.filter(k => 
          k.keyword.includes('buy') || k.keyword.includes('price') || 
          k.keyword.includes('cost') || k.keyword.includes('review')
        ),
        navigational: uniqueKeywords.filter(k => 
          k.keyword.includes('login') || k.keyword.includes('website') || 
          k.keyword.includes('official')
        ),
        local: uniqueKeywords.filter(k => 
          k.keyword.includes('near me') || k.keyword.includes('local') || 
          k.keyword.includes('nearby')
        )
      };

      // Generate search queries for further research
      results.searchQueries = [
        `${baseKeyword} trends`,
        `${baseKeyword} statistics`,
        `${baseKeyword} market research`,
        `${baseKeyword} competitor analysis`,
        `${baseKeyword} audience insights`
      ];

    } catch (error) {
      console.error('Error in keyword expansion:', error);
      results.error = error.message;
    }

    return results;
  },
  {
    name: 'keyword_expander',
    description: 'Expand a base keyword into related topics, variations, and keyword clusters for comprehensive keyword research',
    parameters: {
      type: 'object',
      properties: {
        baseKeyword: {
          type: 'string',
          description: 'The base keyword to expand and generate variations for',
        },
        expansionTypes: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['semantic', 'questions', 'commercial', 'informational', 'local']
          },
          description: 'Types of keyword expansions to generate (default: semantic, questions, modifiers)',
          default: ['semantic', 'questions', 'modifiers']
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of expanded keywords to return (default: 20)',
          default: 20
        }
      },
      required: ['baseKeyword'],
    },
  }
);