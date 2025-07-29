# Google Ad Grant Campaign Generator

**DEVELOPMENT IN PROGRESS...**

## 🎯 Current Implementation Status

### ✅ **COMPLETED FEATURES**

#### **1. Core Infrastructure (Production Ready)**

- **Express.js Server**: Complete REST API with 627 lines of production code
- **Security Layer**: Helmet, CORS, rate limiting, and security headers
- **API Documentation**: Swagger/OpenAPI with custom ReDoc styling
- **Error Handling**: Comprehensive error management and logging
- **Memory Management**: Thread-based conversation tracking

#### **2. LinkedIn Integration (Fully Operational)**

- **Unipile SDK**: Complete integration for LinkedIn company page messaging (ID: 107697030)
- **Webhook Processing**: Real-time message receiving and processing
- **Message Parsing**: URL extraction and instruction processing
- **Auto-Reply System**: Intelligent responses with fallback handling
- **Duplicate Prevention**: Message ID tracking to avoid repeated processing

#### **3. AI Agent System (Advanced)**

- **LangChain Integration**: React Agent pattern with tool calling
- **Multi-Provider Support**: Azure OpenAI and Google Gemini
- **Dynamic Model Switching**: Runtime configuration changes
- **Memory Persistence**: Conversation context management
- **System Prompt Management**: Dynamic prompt loading and caching

#### **4. Research & Analysis Tools (4 Tools)**

- **Website Scraper** (`read_url.js`): Jina.ai integration for content extraction
- **Keyword Expander** (`keyword_expander.js`): Multi-type keyword generation and clustering
- **DuckDuckGo Research** (`duckduckgo_research.js`): Topic research and instant answers
- **DuckDuckGo Keywords** (`duckduckgo_keywords.js`): Related keywords and autocomplete

#### **5. Configuration System**

- **Provider Management**: JSON-based model configuration
- **System Prompts**: File-based prompt management with API updates
- **Environment Configuration**: Secure credential management

## 🚧 **PLANNED DEVELOPMENT PHASES**

### **Phase 2: Campaign Generation Engine**

- Google Ads CSV formatting and export
- Campaign structure generation (2 ad groups per page)
- RSA ad copy creation (2 ads per ad group)
- Budget distribution algorithms ($320 daily budget)
- CPA bidding strategy implementation

### **Phase 3: File Management & Delivery**

- CSV file generation for Google Ads Editor
- Temporary file storage and cleanup
- LinkedIn file attachment system
- Campaign validation and quality checks

### **Phase 4: Advanced Features**

- Direct Google Ads API integration
- Manager account connection
- Performance tracking and optimization
- Bulk processing capabilities

## 🛠 **Technical Architecture**

### **Backend Stack**

```
Express.js → Unipile SDK → LangChain Agents → Research Tools → Response Generation
```

### **AI Processing Flow**

```
LinkedIn Message → URL Extraction → Website Scraping →
Keyword Research → Content Analysis → Response Generation → LinkedIn Reply
```

### **Current Tools & Capabilities**

1. **Website Analysis**: Full-page content extraction via Jina.ai
2. **Keyword Research**: Multi-source keyword generation (25+ keywords per analysis)
3. **Content Intelligence**: DuckDuckGo-powered research and topic expansion
4. **Conversation Management**: Thread-based memory for ongoing conversations
5. **Provider Flexibility**: Switch between Azure OpenAI and Google Gemini

## 📋 **API Endpoints**

### **Core Endpoints**

- `GET /` - API welcome message
- `POST /api/v1/webhook` - LinkedIn message processing
- `GET /api/v1/system-prompt` - Get current system prompt
- `POST /api/v1/system-prompt` - Update system prompt

## 🔧 **Setup & Configuration**

### **Environment Variables**

```env
UNIPILE_BASE_URL=your_unipile_base_url
UNIPILE_ACCESS_TOKEN=your_access_token
ACCOUNT_ID=your_linkedin_account_id
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=your_azure_endpoint
GOOGLE_API_KEY=your_google_gemini_key
PORT=3000
```

### **Installation**

```bash
npm install
npm start
```

### **Provider Configuration**

Edit `src/config/providers.json` to switch between AI models:

```json
{
  "providers": [
    {
      "name": "azure",
      "model": "gpt-4",
      "active": true,
      "maxTokens": 4000,
      "temperature": 0.7
    },
    {
      "name": "google",
      "model": "gemini-pro",
      "active": false,
      "maxTokens": 4000,
      "temperature": 0.7
    }
  ]
}
```

## 🎯 **Current Workflow**

1. **Message Reception**: LinkedIn webhook receives company page messages
2. **URL Processing**: Extract website URLs from message content
3. **Content Analysis**: Scrape website using Jina.ai integration
4. **Research Phase**: Generate keywords and analyze content themes
5. **Response Generation**: Create intelligent LinkedIn response
6. **Reply Delivery**: Send response back through LinkedIn messaging

## 📊 **System Specifications**

### **Performance Metrics**

- **Processing Time**: 15-30 seconds per website analysis
- **Memory Usage**: Thread-based conversation tracking
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Concurrent Processing**: Multiple LinkedIn conversations simultaneously

### **Security Features**

- **Content Security Policy**: Comprehensive CSP headers
- **Rate Limiting**: IP-based request throttling
- **Input Validation**: Message content sanitization
- **Error Handling**: Graceful degradation with fallback responses

## 🔮 **Future Integration Points**

### **Google Ads API Integration** (Phase 4)

- OAuth2 authentication for Google Ads accounts
- Direct campaign upload to Google Ads
- Manager account integration for agencies
- Real-time campaign performance monitoring

### **Enhanced Automation** (Phase 5)

- N8N workflow integration
- Scheduled campaign optimization
- Performance-based budget adjustments
- Multi-language campaign support

## 🏗 **Development Commands**

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# View API documentation
npm run docs
```

## 📝 **Current Limitations**

- **CSV Generation**: Not yet implemented - campaigns are analyzed but not exported
- **File Delivery**: LinkedIn file attachment system pending
- **Budget Distribution**: Logic designed but not implemented
- **Google Ads Format**: CSV structure planned but not built

---

**Status**: 🟡 **Beta** - Core functionality operational, campaign generation in development.
