import express from "express";
import cors from "cors";
import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { UnipileClient } from "unipile-node-sdk";
import archiver from "archiver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { linkedInAgnet, generateWebCampaigns } from "./agnet/adGrantAgnet.js";
import {
  getSystemPrompt,
  updateSystemPrompt,
} from "./utils/systemPromptManager.js";
import { leadManager } from "./utils/leadManager.js";
import { emailService } from "./services/emailService.js";

// Initialize express app
const app = express();
// Trust proxy - required for express-rate-limit behind proxy
app.set("trust proxy", 1);

// Set up middleware
// Configure Helmet with custom CSP to allow external scripts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-eval'",
          "'unsafe-inline'",
          "cdn.tailwindcss.com",
          "unpkg.com",
          "cdn.jsdelivr.net",
          "api.leadpipe.com",
          "www.googletagmanager.com",
          "blob:",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "cdn.tailwindcss.com",
          "cdnjs.cloudflare.com",
          "fonts.googleapis.com",
        ],
        workerSrc: ["'self'", "blob:"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "api.leadpipe.com"],
        fontSrc: [
          "'self'",
          "cdnjs.cloudflare.com",
          "fonts.gstatic.com",
          "fonts.googleapis.com",
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  })
);
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: "50mb" })); // Parse JSON bodies with increased size limit
app.use(express.raw({ type: "application/json" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Add support for URL-encoded bodies
app.use(morgan("dev")); // Logging
app.use(bodyParser.json());

app.use(express.json());
// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.static(path.join(__dirname, "../public")));
// Apply rate limiting to all API routes

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

// API routes
// const API_PREFIX = process.env.API_V1_PREFIX;
const API_PREFIX = process.env.API_V1_PREFIX;

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Admin panel route
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "admin.html"));
});

// Health check endpoint for Docker
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API route to get system prompt
app.get(`${API_PREFIX}/system-prompt`, async (req, res) => {
  try {
    const systemPrompt = await getSystemPrompt();
    res.json({ system_prompt: systemPrompt });
  } catch (error) {
    console.error("Error fetching system prompt:", error);
    res.status(500).json({ error: "Failed to fetch system prompt" });
  }
});

// API route to update system prompt
app.post(`${API_PREFIX}/system-prompt`, async (req, res) => {
  try {
    const { system_prompt } = req.body;
    if (!system_prompt) {
      return res
        .status(400)
        .json({ error: "Missing system_prompt in request body" });
    }
    await updateSystemPrompt(system_prompt);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating system prompt:", error);
    res.status(500).json({ error: "Failed to update system prompt" });
  }
});

// Web campaign generation endpoint
app.post(`${API_PREFIX}/generate-campaigns`, async (req, res) => {
  try {
    const { threadId, websiteUrl, instructions } = req.body;

    // Validate required fields
    if (!threadId || !websiteUrl) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: threadId and websiteUrl are required",
      });
    }

    console.log(`🚀 Starting web campaign generation for: ${websiteUrl}`);

    // Generate campaigns using the web-specific agent
    const result = await generateWebCampaigns(
      threadId,
      websiteUrl,
      instructions || ""
    );

    console.log(`✅ Campaign generation completed for ${websiteUrl}`);

    // Return the structured response
    res.json(result);
  } catch (error) {
    console.error("❌ Error in web campaign generation:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      response: {
        status: "error",
        step: "server_error",
        progress: 0,
        message: `Server error during campaign generation: ${error.message}`,
        data: null,
        recommendations: ["Please try again later or contact support"],
      },
    });
  }
});

// Lead capture endpoint for email collection
app.post(`${API_PREFIX}/capture-lead`, async (req, res) => {
  try {
    const { email, organizationName, websiteUrl, campaignId, consent } =
      req.body;

    // Validate required fields
    if (!email || !consent) {
      return res.status(400).json({
        success: false,
        error: "Email and consent are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    console.log(`📧 Processing lead capture for: ${email}`);

    // Prepare lead data
    const leadData = {
      email: email.toLowerCase().trim(),
      organizationName: organizationName?.trim() || null,
      websiteUrl: websiteUrl || null,
      campaignId: campaignId || `campaign_${Date.now()}`,
      consent: consent === true,
      ipAddress: req.ip || req.connection.remoteAddress || null,
      userAgent: req.get("User-Agent") || null,
    };

    // Check if lead already exists
    const existingLead = leadManager.findByEmail(leadData.email);
    let lead;

    if (existingLead) {
      console.log(`📧 Existing lead found: ${leadData.email}`);
      lead = existingLead;
      // Update campaign info if new one is provided
      if (
        leadData.campaignId &&
        leadData.campaignId !== existingLead.campaignId
      ) {
        // You could update the existing lead here if needed
        console.log(
          `📧 Updating campaign ID for existing lead: ${leadData.campaignId}`
        );
      }
    } else {
      // Create new lead
      lead = leadManager.addLead(leadData);
      if (!lead) {
        return res.status(500).json({
          success: false,
          error: "Failed to save lead information",
        });
      }
    }

    // Generate secure download token
    const downloadToken = leadManager.generateDownloadToken(
      lead.id,
      leadData.campaignId
    );

    // Send email using the email service
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const emailResult = await emailService.sendCampaignEmail(
      leadData,
      downloadToken,
      baseUrl
    );

    // Get current lead statistics
    const stats = leadManager.getStats();

    console.log(`✅ Lead capture successful for: ${email}`);
    console.log(`📊 Current lead stats:`, stats);

    res.json({
      success: true,
      message: "Lead captured successfully",
      data: {
        leadId: lead.id,
        email: lead.email,
        downloadToken,
        emailMethod: emailResult.method,
        mailtoLink: emailResult.mailtoLink || null,
        messageId: emailResult.messageId || null,
        expiresIn: "24 hours",
        campaignId: leadData.campaignId,
      },
      stats: {
        totalLeads: stats.total,
        todayLeads: stats.today,
        conversionRate: stats.conversionRate,
      },
      emailResult,
    });
  } catch (error) {
    console.error("❌ Error in lead capture:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error during lead capture",
    });
  }
});

// Download endpoint for secure file delivery
app.get(`${API_PREFIX}/download/:token`, async (req, res) => {
  try {
    const { token } = req.params;

    // Validate download token
    const tokenData = leadManager.validateDownloadToken(token);
    if (!tokenData) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired download token",
      });
    }

    // Find the lead
    const lead = leadManager.findById(tokenData.leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    // Record the download
    leadManager.recordDownload(lead.id);

    // Generate actual CSV files based on the campaign data
    const campaignData = generateCampaignCSVData(lead);

    // Create ZIP file containing all CSV files
    const zipBuffer = await createCampaignZip(campaignData, lead);

    // Set headers for file download
    const filename = `ad-grant-campaigns-${
      lead.email.split("@")[0]
    }-${Date.now()}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", zipBuffer.length);

    // Send the actual ZIP file
    res.send(zipBuffer);

    console.log(
      `📥 Download completed for lead: ${lead.email} (${
        lead.downloadCount + 1
      } downloads) - File: ${filename}`
    );
  } catch (error) {
    console.error("❌ Error in download endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during download",
    });
  }
});

// Function to generate campaign CSV data
function generateCampaignCSVData(lead) {
  const domain = lead.websiteUrl
    ? new URL(lead.websiteUrl).hostname
    : "organization";
  const orgName = lead.organizationName || domain;

  // Generate realistic campaign structure
  const campaigns = [
    {
      name: `${orgName} - Awareness`,
      status: "Active",
      budget: 160,
      type: "Search",
      bidStrategy: "Target CPA",
      targetCPA: 25,
    },
    {
      name: `${orgName} - Donations`,
      status: "Active",
      budget: 160,
      type: "Search",
      bidStrategy: "Target CPA",
      targetCPA: 30,
    },
  ];

  const adGroups = [];
  const keywords = [];
  const ads = [];

  campaigns.forEach((campaign, campaignIndex) => {
    // Create 2 ad groups per campaign
    for (let i = 1; i <= 2; i++) {
      const adGroupName = `${campaign.name} - Group ${i}`;
      adGroups.push({
        campaign: campaign.name,
        adGroup: adGroupName,
        status: "Active",
        defaultBid: 2.0,
      });

      // Generate 25 keywords per ad group
      const keywordSet = generateKeywordsForOrganization(
        orgName,
        campaign.name,
        i
      );
      keywordSet.forEach((keyword) => {
        keywords.push({
          campaign: campaign.name,
          adGroup: adGroupName,
          keyword: keyword,
          matchType: "Broad",
          maxCPC: 2.5,
        });
      });

      // Generate 2 RSA ads per ad group
      for (let j = 1; j <= 2; j++) {
        ads.push({
          campaign: campaign.name,
          adGroup: adGroupName,
          adType: "Responsive Search Ad",
          headlines: generateHeadlines(orgName, campaign.name),
          descriptions: generateDescriptions(orgName, campaign.name),
          finalURL: lead.websiteUrl || "https://example.com",
          status: "Active",
        });
      }
    }
  });

  return { campaigns, adGroups, keywords, ads };
}

// Generate keywords based on organization and campaign type
function generateKeywordsForOrganization(orgName, campaignName, groupNum) {
  const baseKeywords = [
    "nonprofit",
    "charity",
    "donate",
    "volunteer",
    "support",
    "help",
    "community",
    "organization",
    "foundation",
    "giving",
    "fundraising",
    "cause",
    "mission",
    "social good",
    "make a difference",
    "change lives",
    "impact",
    "philanthropy",
    "humanitarian",
    "outreach",
    "assistance",
    "aid",
    "relief",
    "service",
  ];

  const orgKeywords = [
    orgName.toLowerCase(),
    `${orgName.toLowerCase()} charity`,
    `${orgName.toLowerCase()} nonprofit`,
    `${orgName.toLowerCase()} donate`,
    `${orgName.toLowerCase()} volunteer`,
  ];

  const campaignSpecific = campaignName.includes("Awareness")
    ? [
        "learn about",
        "information",
        "awareness",
        "education",
        "programs",
        "services",
        "what we do",
        "our mission",
        "about us",
        "get involved",
      ]
    : [
        "donate now",
        "make donation",
        "financial support",
        "contribute",
        "help fund",
        "sponsor",
        "give money",
        "online donation",
        "secure donation",
      ];

  // Combine and take 25 keywords
  const allKeywords = [...baseKeywords, ...orgKeywords, ...campaignSpecific];
  return allKeywords.slice(0, 25);
}

// Generate headlines for RSA ads
function generateHeadlines(orgName, campaignName) {
  const headlines = [
    `Support ${orgName} Today`,
    `Make a Difference Now`,
    `Help Change Lives`,
    `Your Donation Matters`,
    `Join Our Mission`,
    `Transform Communities`,
    `Create Lasting Impact`,
    `Be Part of Change`,
    `Help Those in Need`,
    `Support Our Cause`,
    `Make Hope Possible`,
    `Your Help is Needed`,
    `Together We Can Help`,
    `Change Lives Today`,
    `Support Our Work`,
  ];

  return headlines.slice(0, 15); // RSA needs up to 15 headlines
}

// Generate descriptions for RSA ads
function generateDescriptions(orgName, campaignName) {
  const descriptions = [
    `Join ${orgName} in making a real difference in people's lives. Your support helps us continue our vital work.`,
    `Every donation to ${orgName} helps create positive change. Support our mission today and see the impact.`,
    `Help us transform communities through our programs. Your contribution makes our work possible.`,
    `Make a lasting impact with ${orgName}. Your support helps us reach more people who need assistance.`,
  ];

  return descriptions;
}

// Function to create ZIP file with all CSV files
async function createCampaignZip(data, lead) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks = [];

  // Collect ZIP data
  archive.on("data", (chunk) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    archive.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });

    archive.on("error", reject);

    // Generate CSV content for each file
    const campaignsCSV = generateCampaignsCSV(data.campaigns);
    const adGroupsCSV = generateAdGroupsCSV(data.adGroups);
    const keywordsCSV = generateKeywordsCSV(data.keywords);
    const adsCSV = generateAdsCSV(data.ads);

    // Add files to ZIP
    archive.append(campaignsCSV, { name: "campaigns.csv" });
    archive.append(adGroupsCSV, { name: "ad_groups.csv" });
    archive.append(keywordsCSV, { name: "keywords.csv" });
    archive.append(adsCSV, { name: "ads.csv" });
    archive.append(generateReadme(lead), { name: "README.txt" });

    archive.finalize();
  });
}

// CSV generation functions
function generateCampaignsCSV(campaigns) {
  const headers = "Campaign,Status,Budget,Type,Bid Strategy,Target CPA\n";
  const rows = campaigns
    .map(
      (c) =>
        `"${c.name}","${c.status}",${c.budget},"${c.type}","${c.bidStrategy}",${c.targetCPA}`
    )
    .join("\n");
  return headers + rows;
}

function generateAdGroupsCSV(adGroups) {
  const headers = "Campaign,Ad Group,Status,Default Bid\n";
  const rows = adGroups
    .map(
      (ag) => `"${ag.campaign}","${ag.adGroup}","${ag.status}",${ag.defaultBid}`
    )
    .join("\n");
  return headers + rows;
}

function generateKeywordsCSV(keywords) {
  const headers = "Campaign,Ad Group,Keyword,Match Type,Max CPC\n";
  const rows = keywords
    .map(
      (k) =>
        `"${k.campaign}","${k.adGroup}","${k.keyword}","${k.matchType}",${k.maxCPC}`
    )
    .join("\n");
  return headers + rows;
}

function generateAdsCSV(ads) {
  const headers =
    "Campaign,Ad Group,Ad Type,Headlines,Descriptions,Final URL,Status\n";
  const rows = ads
    .map(
      (ad) =>
        `"${ad.campaign}","${ad.adGroup}","${ad.adType}","${ad.headlines.join(
          " | "
        )}","${ad.descriptions.join(" | ")}","${ad.finalURL}","${ad.status}"`
    )
    .join("\n");
  return headers + rows;
}

function generateReadme(lead) {
  return `Google Ads Editor Import Instructions

Generated for: ${lead.email}
Organization: ${lead.organizationName || "N/A"}
Website: ${lead.websiteUrl || "N/A"}
Generated: ${new Date().toLocaleString()}

IMPORT ORDER (CRITICAL):
1. campaigns.csv
2. ad_groups.csv  
3. keywords.csv
4. ads.csv

HOW TO IMPORT:
1. Open Google Ads Editor
2. Select your Google Ad Grant account
3. File > Import > From file
4. Import files in the order listed above
5. Review all campaigns before posting
6. Click "Post" to upload to Google Ads

IMPORTANT NOTES:
- Ensure your Google Ad Grant account is approved
- Review budgets and bids before posting
- Monitor campaign performance weekly
- Adjust keywords based on search terms report

Need help? Contact support with your Campaign ID: ${lead.campaignId}
`;
}

// Lead statistics endpoint (optional - for admin/monitoring)
app.get(`${API_PREFIX}/lead-stats`, async (req, res) => {
  try {
    const stats = leadManager.getStats();
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("❌ Error fetching lead stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
});

// Admin authentication endpoint
app.post(`${API_PREFIX}/admin/login`, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate credentials against environment variables
    const adminUsername = process.env.ADMIN_USER_NAME;
    const adminPassword = process.env.ADMIN_USER_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return res.status(500).json({
        success: false,
        error: "Admin credentials not configured",
      });
    }

    if (username !== adminUsername || password !== adminPassword) {
      console.log(`🚫 Admin login failed for username: ${username}`);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    console.log(`✅ Admin login successful for: ${username}`);

    // For now, we'll use a simple session approach
    const sessionToken =
      Date.now().toString(36) + Math.random().toString(36).substr(2);

    res.json({
      success: true,
      message: "Login successful",
      token: sessionToken,
      user: {
        username: adminUsername,
        role: "admin",
        loginTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error in admin login:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during login",
    });
  }
});

// Admin dashboard data endpoint
app.get(`${API_PREFIX}/admin/dashboard`, async (req, res) => {
  try {
    // Get comprehensive stats
    const leadStats = leadManager.getStats();

    // Get recent leads (last 10)
    const allLeads = leadManager.loadLeads();
    const recentLeads = allLeads
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((lead) => ({
        id: lead.id,
        email: lead.email,
        organizationName: lead.organizationName,
        websiteUrl: lead.websiteUrl,
        createdAt: lead.createdAt,
        downloadCount: lead.downloadCount,
        lastDownload: lead.lastDownload,
      }));

    // Calculate additional metrics
    const totalLeads = allLeads.length;
    const leadsWithDownloads = allLeads.filter(
      (lead) => lead.downloadCount > 0
    ).length;
    const averageDownloads =
      totalLeads > 0
        ? (
            allLeads.reduce((sum, lead) => sum + lead.downloadCount, 0) /
            totalLeads
          ).toFixed(2)
        : 0;

    const dashboardData = {
      overview: {
        totalLeads: leadStats.total,
        todayLeads: leadStats.today,
        thisWeekLeads: leadStats.thisWeek,
        thisMonthLeads: leadStats.thisMonth,
        conversionRate: leadStats.conversionRate,
        totalDownloads: leadStats.totalDownloads,
        averageDownloads: parseFloat(averageDownloads),
      },
      recentActivity: recentLeads,
      systemInfo: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
        lastRestart: new Date().toISOString(),
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("❌ Error fetching admin dashboard data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard data",
    });
  }
});

// Admin leads management endpoint
app.get(`${API_PREFIX}/admin/leads`, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "" } = req.query;
    const allLeads = leadManager.loadLeads();

    // Filter leads if search query provided
    let filteredLeads = allLeads;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLeads = allLeads.filter(
        (lead) =>
          lead.email.toLowerCase().includes(searchLower) ||
          (lead.organizationName &&
            lead.organizationName.toLowerCase().includes(searchLower)) ||
          (lead.websiteUrl &&
            lead.websiteUrl.toLowerCase().includes(searchLower))
      );
    }

    // Sort by creation date (newest first)
    filteredLeads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate results
    const startIndex = (page - 1) * limit;
    const paginatedLeads = filteredLeads.slice(
      startIndex,
      startIndex + parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        leads: paginatedLeads,
        pagination: {
          total: filteredLeads.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(filteredLeads.length / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching leads:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch leads data",
    });
  }
});

// Unipile configuration
// Unipile configuration
const UNIPILE_BASE_URL =
  process.env.UNIPILE_BASE_URL || "https://api1.unipile.com:13153";
const UNIPILE_ACCESS_TOKEN = process.env.UNIPILE_ACCESS_TOKEN;
const ACCOUNT_ID = process.env.ACCOUNT_ID;

// Fallback auto-reply message (used when AI processing fails)
const AUTO_REPLY_MESSAGE = "Thanks! I will be back soon 😊";

// Store processed message IDs to avoid duplicate replies
const processedMessages = new Set();

// Initialize Unipile client
const client = new UnipileClient(UNIPILE_BASE_URL, UNIPILE_ACCESS_TOKEN);

// Helper function to send message via Unipile SDK
async function sendReply(accountId, chatId, message, originalMessageId) {
  try {
    console.log(`🚀 Sending reply to chat ${chatId} for account ${accountId}`);

    const response = await client.messaging.sendMessage({
      account_id: accountId,
      chat_id: chatId,
      text: message,
    });

    console.log(`✅ Reply sent successfully:`, response);
    return response;
  } catch (error) {
    console.error(`❌ Error sending reply:`, {
      message: error.message,
      response: error.response?.data || error.data,
      status: error.response?.status || error.status,
    });
    throw error;
  }
}

// Updated webhook endpoint with comprehensive error handling
app.post("/api/v1/adgrant/webhook", async (req, res) => {
  try {
    console.log("\n🔔 Webhook received!");

    const webhookData = req.body;
    console.log(webhookData);

    // Extract message details from Unipile webhook format
    const messageId = webhookData.message_id;
    const chatId = webhookData.chat_id;
    const accountId = webhookData.account_id || ACCOUNT_ID;
    const sender = webhookData.sender;
    const messageText = webhookData.message;
    const timestamp = webhookData.timestamp;

    console.log(`📩 Message received:`, {
      messageId,
      chatId,
      accountId,
      sender: sender?.name || sender,
      messageText: messageText?.substring(0, 100) + "...",
      timestamp,
    });

    // Skip if no required data
    if (!messageId || !chatId || !messageText) {
      console.log("⚠️  Missing required data, skipping");
      return res.status(200).json({
        status: "ignored",
        reason: "missing_required_data",
        received: { messageId, chatId, messageText },
      });
    }

    // Avoid replying to our own messages or duplicate processing
    if (processedMessages.has(messageId)) {
      console.log("⚠️  Message already processed, skipping");
      return res
        .status(200)
        .json({ status: "ignored", reason: "already_processed" });
    }

    // Skip if the message is from ourselves (avoid infinite loops)
    if (
      sender?.attendee_name &&
      (sender.attendee_name.toLowerCase().includes("google ad grant ai") ||
        sender.attendee_name.toLowerCase().includes("ad grant ai") ||
        sender.attendee_name.toLowerCase().includes("lisa green") ||
        sender.attendee_provider_id === "79429914" ||
        sender.attendee_provider_id === "107697030")
    ) {
      console.log("⚠️  Message from our own account, skipping");
      console.log(
        `🔍 Detected own message from: ${sender.attendee_name} (ID: ${sender.attendee_provider_id})`
      );
      return res.status(200).json({ status: "ignored", reason: "own_message" });
    }

    // Also skip if message text matches our auto-reply or contains AI response patterns (additional safety)
    const aiResponsePatterns = [
      AUTO_REPLY_MESSAGE.trim(),
      "Thank you for your message!",
      "If you're ready to move forward",
      "please share your nonprofit",
      "website URL with me",
      "I'll analyze it to create",
      "tailored Google Ad Grant",
      "We appear to have entered an infinite response loop",
      "It seems we're having a bit of back-and-forth",
    ];

    const messageContainsAIPattern = aiResponsePatterns.some(
      (pattern) =>
        messageText && messageText.toLowerCase().includes(pattern.toLowerCase())
    );

    if (messageContainsAIPattern) {
      console.log("⚠️  Message contains AI response patterns, skipping");
      console.log(
        `🔍 Detected AI pattern in message: ${messageText?.substring(
          0,
          100
        )}...`
      );
      return res
        .status(200)
        .json({ status: "ignored", reason: "ai_response_pattern_detected" });
    }

    // Mark message as processed
    processedMessages.add(messageId);

    // Check if usage middleware has set a limit exceeded response
    if (req.limitExceededResponse) {
      console.log(
        `🚫 Usage limit exceeded for user ${chatId}, sending limit exceeded message`
      );

      try {
        // Send the limit exceeded message (includes email request or checkout link)
        await sendReply(
          accountId,
          chatId,
          req.limitExceededResponse,
          messageId
        );

        res.status(200).json({
          status: "limit_exceeded",
          message: "Usage limit exceeded message sent",
          messageId,
          chatId,
          threadId: chatId,
          reply: req.limitExceededResponse?.substring(0, 200) + "...", // Truncate for logging
        });
      } catch (replyError) {
        console.error(
          "❌ Failed to send limit exceeded message:",
          replyError.message
        );

        // Fallback to auto-reply if sending limit message fails
        try {
          console.log(
            "🔄 Falling back to auto-reply due to limit message error"
          );
          await sendReply(accountId, chatId, AUTO_REPLY_MESSAGE, messageId);
          res.status(200).json({
            status: "fallback_success",
            message: "Fallback auto-reply sent due to limit message error",
            messageId,
            chatId,
            error: replyError.message,
            reply: AUTO_REPLY_MESSAGE,
          });
        } catch (fallbackError) {
          console.error("❌ Even fallback failed:", fallbackError.message);
          res.status(200).json({
            status: "webhook_received",
            error: "failed_to_reply",
            messageId,
            chatId,
            limitError: replyError.message,
            fallbackError: fallbackError.message,
          });
        }
      }
      return; // Important: return here to avoid processing the AI query
    }

    // Process the query using LinkedIn chatbot and send intelligent reply
    try {
      console.log(`🤖 Processing LinkedIn query with threadId: ${chatId}`);

      // Use processLinkedInQuery to generate intelligent response
      const intelligentResponse = await linkedInAgnet(chatId, messageText);

      console.log(
        `🧠 Generated response: ${intelligentResponse?.substring(0, 100)}...`
      );

      // Send the intelligent response
      await sendReply(accountId, chatId, intelligentResponse, messageId);

      res.status(200).json({
        status: "success",
        message: "Intelligent reply sent",
        messageId,
        chatId,
        threadId: chatId,
        reply: intelligentResponse?.substring(0, 200) + "...", // Truncate for logging
      });
    } catch (replyError) {
      console.error(
        "❌ Failed to process query or send reply:",
        replyError.message
      );

      // Fallback to auto-reply if AI processing fails
      try {
        console.log("🔄 Falling back to auto-reply due to error");
        await sendReply(accountId, chatId, AUTO_REPLY_MESSAGE, messageId);
        res.status(200).json({
          status: "fallback_success",
          message: "Fallback auto-reply sent due to AI processing error",
          messageId,
          chatId,
          error: replyError.message,
          reply: AUTO_REPLY_MESSAGE,
        });
      } catch (fallbackError) {
        console.error("❌ Even fallback failed:", fallbackError.message);
        res.status(200).json({
          status: "webhook_received",
          error: "failed_to_reply",
          messageId,
          chatId,
          aiError: replyError.message,
          fallbackError: fallbackError.message,
        });
      }
    }
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(200).json({
      status: "error",
      message: error.message,
    });
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down webhook server...");
  process.exit(0);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
