# 🎯 Ad Grant AI - Professional Google Ad Grant Campaign Generator

**Ad Grant AI** is a complete automation system that helps nonprofits create professional Google Ads campaigns. Simply provide a website URL, and get back ready-to-use campaign files for Google Ads Editor.

### **For Users (Nonprofits)**

- Visit the professional website interface
- Enter your nonprofit's website URL
- Receive professional campaign files via email
- Import directly into Google Ads Editor
- Launch $10,000/month Google Ad Grant campaigns

### **For Business (Ad Grant AI)**

- Generate leads through email capture
- Deliver professional campaign files automatically
- Monitor performance through admin dashboard
- Build email list of potential clients

---

## 🎯 **Complete Features Built**

### ✅ **1. Professional Website Interface**

- **Beautiful Design**: Google-level user experience with Material Design
- **Smart Form**: URL validation and user-friendly interface
- **Real-time Progress**: Live tracking of campaign generation process
- **Mobile Friendly**: Works perfectly on all devices

### ✅ **2. Email Capture & Lead Generation**

- **100% Lead Capture**: All downloads require email address
- **Professional Email Templates**: Branded emails from `noreply@adgrant.ai`
- **Google Workspace Integration**: Enterprise-grade email delivery
- **Automated Follow-up**: Professional email templates with download links

### ✅ **3. Campaign Generation Engine**

- **Website Analysis**: Automatically analyzes nonprofit websites
- **Smart Campaign Creation**: Creates website-specific campaigns (not generic templates)
- **Google Ad Grant Compliant**: Follows all Google Ad Grant requirements
- **Professional Structure**: 2 ad groups per campaign, 25 keywords each
- **Ready-to-Import Files**: Google Ads Editor compatible CSV files

### ✅ **4. Admin Dashboard**

- **Lead Management**: View all captured leads and contact information
- **Real-time Statistics**: Track conversions and campaign generation
- **Email Monitoring**: See successful email deliveries
- **Professional Interface**: Clean, easy-to-use admin panel

### ✅ **5. LinkedIn Integration**

- **Company Page Integration**: Responds to LinkedIn messages on @ad-grant-ai
- **Automatic Processing**: Analyzes website URLs sent via LinkedIn
- **Professional Responses**: AI-powered replies to LinkedIn messages
- **Lead Generation**: Captures prospects from LinkedIn interactions

### ✅ **6. Google Workspace Email Service**

- **Professional Branding**: Emails sent from `noreply@adgrant.ai`
- **High Deliverability**: Enterprise-grade email infrastructure
- **Automatic Delivery**: Users receive campaign files in their inbox
- **Branded Templates**: Professional HTML email designs

---

## 🚀 **How It Works**

### **Step 1: User Visits Website**

- Professional landing page at [adgrant.ai](https://adgrant.ai)
- Clean, trustworthy design builds confidence
- Simple form asks for website URL and optional instructions

### **Step 2: Campaign Generation**

- System analyzes the nonprofit's website
- Extracts mission, services, and target audience
- Creates tailored Google Ad Grant campaigns
- Generates Google Ads Editor compatible files

### **Step 3: Email Capture**

- User must provide email to access campaigns
- Professional email sent from `noreply@adgrant.ai`
- Download link with 24-hour expiration for security

### **Step 4: File Delivery**

- ZIP file contains all necessary CSV files:
  - Campaigns.csv
  - Ad Groups.csv
  - Keywords.csv
  - Responsive Search Ads.csv
- Ready to import into Google Ads Editor

---

## 📊 **Business Results**

### **Lead Generation**

- ✅ **100% Email Capture**: Every user provides contact information
- ✅ **Professional Follow-up**: Automated email sequences
- ✅ **Lead Analytics**: Track conversion rates and sources
- ✅ **Admin Dashboard**: Monitor all lead activity

### **Campaign Quality**

- ✅ **Website-Specific**: Each campaign tailored to the actual organization
- ✅ **Google Compliant**: Follows all Google Ad Grant requirements
- ✅ **Professional Structure**: Industry-standard campaign organization
- ✅ **Ready-to-Launch**: No additional editing required

### **Brand Presentation**

- ✅ **Professional Design**: Google-level user experience
- ✅ **Trusted Domain**: All emails from `adgrant.ai` domain
- ✅ **Consistent Branding**: Professional appearance throughout
- ✅ **High Deliverability**: Emails land in inbox, not spam

---

## 🔧 **System Components**

### **Web Interface** (`https://adgrant.ai`)

- Professional campaign generation form
- Real-time progress tracking
- Email capture and validation
- Mobile-responsive design

### **Admin Panel** (`https://adgrant.ai/admin.html`)

- Lead management dashboard
- Email delivery tracking
- System performance monitoring
- Secure admin authentication

### **Email System**

- Google Workspace integration
- Professional email templates
- Automated delivery system
- 24-hour download links

### **LinkedIn Integration**

- Company page message processing
- Automatic URL extraction
- Professional AI responses
- Lead capture from social media

---

## 💼 **Perfect for Business**

### **Immediate Revenue Opportunities**

- **Lead Generation**: Build email list of nonprofit decision makers
- **Service Upselling**: Offer additional marketing services to leads
- **Consultation Booking**: Include calendar links in follow-up emails
- **Premium Features**: Offer advanced campaign management services

### **Professional Credibility**

- **Enterprise-grade Platform**: Professional appearance builds trust
- **Google Workspace Email**: Branded `@adgrant.ai` email communication
- **High-quality Deliverables**: Professional campaign files
- **Automated Follow-up**: Consistent professional communication

### **Scalable Business Model**

- **Automated Lead Capture**: System runs 24/7 without manual intervention
- **Quality Pipeline**: Pre-qualified nonprofit leads with funding
- **Professional Presentation**: Positions business as industry expert
- **Data-driven Optimization**: Track and improve conversion rates

---

## 🎯 **Current Status: PRODUCTION READY**

✅ **Website**: Professional interface live and functional  
✅ **Email System**: Google Workspace configured and delivering  
✅ **Campaign Generation**: Creating website-specific campaigns  
✅ **Lead Capture**: 100% email collection before download  
✅ **Admin Dashboard**: Complete lead management system  
✅ **LinkedIn Integration**: AI responding to company page messages

---

## ⚙️ **Environment Variables Configuration**

### **Required Environment Variables**

Create a `.env` file in the project root with these variables:

```env
# ==============================================
# Core Application Settings
# ==============================================
NODE_ENV=development
PORT=3000
BASE_URL=https://adgrant.ai
API_V1_PREFIX=/api/v1

# ==============================================
# Azure OpenAI Configuration
# ==============================================
MODEL_NAME=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_API_INSTANCE_NAME=
AZURE_OPENAI_API_DEPLOYMENT_NAME=
AZURE_OPENAI_API_VERSION=

# ==============================================
# Authentication & Security
# ==============================================
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ==============================================
# Rate Limiting
# ==============================================
RATE_LIMIT_PER_HOUR=100
PAID_RATE_LIMIT_PER_HOUR=1000

# ==============================================
# Admin Panel Configuration
# ==============================================
ADMIN_USER_NAME=admin@adgrant.ai
ADMIN_USER_PASSWORD=your_secure_admin_password_here

# ==============================================
# Google Workspace Email Configuration
# ==============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@adgrant.ai
SMTP_PASS=your_16_character_app_password_here
SMTP_FROM=noreply@adgrant.ai

# ==============================================
# LinkedIn Integration (Unipile)
# ==============================================
ACCOUNT_ID=
UNIPILE_BASE_URL=
UNIPILE_ACCESS_TOKEN=
WEB_HOOK_URL=https://adgrant.ai/api/v1/adgrant/webhook
COMPANY_MAILBOX_ID=
LINKEDIN_COMPANY_NAME=ad-grant-ai

# ==============================================
# External APIs
# ==============================================
JINJA_API_KEY=
```

## 🚀 **Installation & Setup**

### **Prerequisites**

- Node.js 18+
- npm or yarn
- Google Workspace account for `adgrant.ai` domain
- Azure OpenAI API access
- Unipile account for LinkedIn integration

### **1. Clone Repository**

```bash
git clone https://github.com/top-rated/adgrant.ai.git
cd adgrant.ai
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Environment Setup**

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your actual values
# Follow GOOGLE_WORKSPACE_SETUP.md for email configuration
```

### **4. Google Workspace Email Setup**

Follow the detailed guide in [GOOGLE_WORKSPACE_SETUP.md](./GOOGLE_WORKSPACE_SETUP.md) to configure professional email delivery from `noreply@adgrant.ai`.

### **5. Run Development Server**

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

### **6. Access the Application**

- **Main Interface**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin.html
- **API Documentation**: http://localhost:3000/docs

## 🔧 **API Endpoints**

### **Campaign Generation**

```bash
POST /api/v1/generate-campaigns
Content-Type: application/json

{
  "websiteUrl": "https://nonprofit-website.org",
  "instructions": "Focus on educational programs"
}
```

### **Lead Capture**

```bash
POST /api/v1/capture-lead
Content-Type: application/json

{
  "email": "user@nonprofit.org",
  "organizationName": "Example Nonprofit",
  "websiteUrl": "https://nonprofit-website.org",
  "campaignId": "campaign-123",
  "consent": true
}
```

### **Admin Dashboard**

```bash
GET /api/v1/admin/dashboard
Authorization: Bearer <admin-jwt-token>
```

### **LinkedIn Webhook**

```bash
POST /api/v1/webhook
Content-Type: application/json
# Handles LinkedIn messages from Unipile
```

## 📁 **Project Structure**

```
ad-grant-ai/
├── src/
│   ├── index.js                 # Main application entry
│   ├── agnet/
│   │   └── adGrantAgnet.js      # Campaign generation AI agent
│   ├── models/
│   │   ├── azure_openai.js      # Azure OpenAI integration
│   │   └── google_gemini.js     # Google Gemini integration
│   ├── services/
│   │   └── emailService.js      # Google Workspace email service
│   ├── tools/
│   │   ├── read_url.js          # Website scraping tool
│   │   ├── convert_to_csv.js    # CSV generation tool
│   │   └── duckduckgo_*.js      # Keyword research tools
│   └── utils/
│       ├── leadManager.js       # Lead data management
│       └── systemPromptManager.js # AI prompt management
├── public/
│   ├── index.html              # Main website interface
│   ├── admin.html              # Admin dashboard
│   ├── css/styles.css          # Professional styling
│   └── js/
│       ├── app.js              # Main website functionality
│       └── admin.js            # Admin panel functionality
├── data/                       # Lead data storage (JSON files)
├── exports/                    # Generated campaign CSV files
└── logs/                       # Application logs
```

## 🛠️ **Development**

### **Available Scripts**

```bash
npm start          # Run production server
npm run dev        # Run development server with nodemon
```

### **Testing the System**

1. **Website Interface**: Visit http://localhost:3000 and test campaign generation
2. **Admin Panel**: Access http://localhost:3000/admin.html with admin credentials
3. **Email Service**: Check console logs for email delivery confirmations
4. **LinkedIn Integration**: Send test messages to LinkedIn company page

## 🔍 **Troubleshooting**

### **Common Issues**

**Email Service Not Working:**

- Verify Google Workspace setup in [GOOGLE_WORKSPACE_SETUP.md](./GOOGLE_WORKSPACE_SETUP.md)
- Check that `SMTP_PASS` is exactly 16 characters (app password)
- Ensure `noreply@adgrant.ai` service account is properly configured

**Campaign Generation Failing:**

- Verify Azure OpenAI API credentials
- Check that website URL is accessible
- Review console logs for specific error messages

**LinkedIn Integration Issues:**

- Verify Unipile webhook URL is correct
- Check LinkedIn company page message settings
- Review webhook payload in logs

**Admin Panel Access Issues:**

- Verify `ADMIN_USER_NAME` and `ADMIN_USER_PASSWORD` are set
- Check JWT secret configuration
- Clear browser cache and cookies

## 📞 **Next Steps**

### **1. Google Workspace Setup**

Follow the [GOOGLE_WORKSPACE_SETUP.md](./GOOGLE_WORKSPACE_SETUP.md) guide to configure professional email delivery from `noreply@adgrant.ai`.

### **2. Lead Follow-up Strategy**

Implement follow-up email sequences to convert captured leads into paying customers for additional services.
