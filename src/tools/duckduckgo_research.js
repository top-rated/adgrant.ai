import { tool } from '@langchain/core/tools';

export const duckDuckGoKeywordResearch = tool(
  async (input) => {
    try {
      const { query, type = 'suggestions' } = input;
      
      if (type === 'suggestions') {
        // DuckDuckGo Instant Answer API for autocomplete suggestions
        const suggestionsUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`;
        const response = await fetch(suggestionsUrl);
        const suggestions = await response.json();
        
        return {
          query,
          type: 'autocomplete_suggestions',
          data: suggestions.map(item => ({
            phrase: item.phrase,
            snippet: item.snippet || ''
          }))
        };
      } else if (type === 'instant') {
        // DuckDuckGo Instant Answer API for related topics
        const instantUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        const response = await fetch(instantUrl);
        const data = await response.json();
        
        const relatedTopics = [];
        
        // Extract related topics from various sections
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
          data.RelatedTopics.forEach(topic => {
            if (topic.Text) {
              relatedTopics.push({
                text: topic.Text,
                firstURL: topic.FirstURL || '',
                icon: topic.Icon ? topic.Icon.URL : ''
              });
            }
          });
        }
        
        // Extract results from definition if available
        const results = {
          query,
          type: 'instant_answer',
          abstract: data.Abstract || '',
          abstractText: data.AbstractText || '',
          abstractSource: data.AbstractSource || '',
          abstractURL: data.AbstractURL || '',
          heading: data.Heading || '',
          answer: data.Answer || '',
          answerType: data.AnswerType || '',
          definition: data.Definition || '',
          definitionSource: data.DefinitionSource || '',
          definitionURL: data.DefinitionURL || '',
          relatedTopics,
          infobox: data.Infobox || null
        };
        
        return results;
      } else if (type === 'zero_click') {
        // Alternative endpoint for zero-click info
        const zeroClickUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
        const response = await fetch(zeroClickUrl);
        const data = await response.json();
        
        // Extract keywords and topics from the response
        const keywords = [];
        
        // Extract from abstract
        if (data.AbstractText) {
          const words = data.AbstractText.toLowerCase().match(/\b\w{3,}\b/g) || [];
          keywords.push(...words.filter(word => word.length > 3));
        }
        
        // Extract from related topics
        if (data.RelatedTopics) {
          data.RelatedTopics.forEach(topic => {
            if (topic.Text) {
              const topicWords = topic.Text.toLowerCase().match(/\b\w{3,}\b/g) || [];
              keywords.push(...topicWords.filter(word => word.length > 3));
            }
          });
        }
        
        // Remove duplicates and common words
        const commonWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'];
        const uniqueKeywords = [...new Set(keywords)]
          .filter(keyword => !commonWords.includes(keyword))
          .slice(0, 20);
        
        return {
          query,
          type: 'keyword_extraction',
          extractedKeywords: uniqueKeywords,
          abstract: data.AbstractText || '',
          relatedTopicsCount: data.RelatedTopics ? data.RelatedTopics.length : 0
        };
      }
      
    } catch (error) {
      return {
        query: input.query || '',
        type: 'error',
        error: error.message,
        suggestions: ['Try a different search term', 'Check your internet connection', 'Use simpler keywords']
      };
    }
  },
  {
    name: 'duckduckgo_keyword_research',
    description: 'Research keywords and topics using DuckDuckGo API. Supports autocomplete suggestions, instant answers, and keyword extraction for content research.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query or keyword to research',
        },
        type: {
          type: 'string',
          enum: ['suggestions', 'instant', 'zero_click'],
          description: 'Type of research: "suggestions" for autocomplete, "instant" for related topics and instant answers, "zero_click" for keyword extraction',
          default: 'suggestions'
        },
      },
      required: ['query'],
    },
  }
);

export const duckduckgoTopicExpander = tool(
  async (input) => {
    try {
      const { baseKeyword, maxSuggestions = 10 } = input;
      
      // Generate variations of the base keyword
      const variations = [
        `${baseKeyword} tips`,
        `${baseKeyword} guide`,
        `${baseKeyword} how to`,
        `${baseKeyword} best`,
        `${baseKeyword} benefits`,
        `${baseKeyword} examples`,
        `${baseKeyword} strategies`,
        `${baseKeyword} tools`,
        `${baseKeyword} trends`,
        `${baseKeyword} analysis`
      ];
      
      const allSuggestions = [];
      
      // Get suggestions for each variation
      for (const variation of variations.slice(0, 5)) {
        try {
          const suggestionsUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(variation)}&type=list`;
          const response = await fetch(suggestionsUrl);
          const suggestions = await response.json();
          
          if (suggestions && suggestions.length > 0) {
            allSuggestions.push(...suggestions.slice(0, 3).map(item => ({
              original: variation,
              suggestion: item.phrase || item,
              snippet: item.snippet || ''
            })));
          }
        } catch (err) {
          console.warn(`Failed to get suggestions for: ${variation}`);
        }
      }
      
      // Remove duplicates and limit results
      const uniqueSuggestions = allSuggestions
        .filter((item, index, self) => 
          index === self.findIndex(t => t.suggestion === item.suggestion)
        )
        .slice(0, maxSuggestions);
      
      return {
        baseKeyword,
        type: 'topic_expansion',
        expandedTopics: uniqueSuggestions,
        totalFound: uniqueSuggestions.length,
        variationsUsed: variations.slice(0, 5)
      };
      
    } catch (error) {
      return {
        baseKeyword: input.baseKeyword || '',
        type: 'error',
        error: error.message,
        expandedTopics: []
      };
    }
  },
  {
    name: 'duckduckgo_topic_expander',
    description: 'Expand a base keyword into related topics and variations using DuckDuckGo autocomplete. Perfect for content ideation and keyword research.',
    parameters: {
      type: 'object',
      properties: {
        baseKeyword: {
          type: 'string',
          description: 'The base keyword to expand into related topics',
        },
        maxSuggestions: {
          type: 'number',
          description: 'Maximum number of suggestions to return (default: 10)',
          default: 10
        },
      },
      required: ['baseKeyword'],
    },
  }
);