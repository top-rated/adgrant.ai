import express from "express";
import cors from "cors";
import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import bodyParser from "body-parser";
import { UnipileClient } from "unipile-node-sdk";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import redocExpress from "redoc-express";

import { linkedInAgnet } from "./agnet/adGrantAgnet.js";
import {
  getSystemPrompt,
  updateSystemPrompt,
} from "./utils/systemPromptManager.js";

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

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

// API routes
// const API_PREFIX = process.env.API_V1_PREFIX;
const API_PREFIX = "/api/v1";

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Google Ad Grant Generator API",
  })
});



// Swagger configuration
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Google Ad Grant Generator API",
      version: "1.0.0",
      description:
        "API for generating Google Ad Grant campaigns from website URLs",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/index.js"], // Path to the main file containing endpoints
};
const specs = swaggerJsdoc(options);

// API documentation routes
app.use(`${API_PREFIX}/api-docs`, swaggerUi.serve, swaggerUi.setup(specs));

app.get(
  `${API_PREFIX}/redoc`,
  redocExpress({
    title: "Google Ad Grant Generator API",
    specUrl: `${API_PREFIX}/api-docs.json`,
    customCss: fs.readFileSync("./src/redoc-custom.css", "utf8"),
    theme: {
      colors: {
        primary: {
          main: "#2563eb",
          light: "#3b82f6",
          dark: "#1d4ed8",
        },
        success: {
          main: "#10b981",
          light: "#34d399",
          dark: "#059669",
        },
        warning: {
          main: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
        error: {
          main: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
        },
        text: {
          primary: "#1f2937",
          secondary: "#6b7280",
        },
        border: {
          dark: "#e5e7eb",
          light: "#f3f4f6",
        },
      },
      typography: {
        fontSize: "14px",
        lineHeight: "1.5",
        code: {
          fontSize: "13px",
          fontFamily:
            'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        },
        headings: {
          fontFamily:
            '"Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", sans-serif',
          fontWeight: "600",
        },
      },
      sidebar: {
        backgroundColor: "#f8fafc",
        textColor: "#374151",
        activeTextColor: "#2563eb",
      },
      rightPanel: {
        backgroundColor: "#1f2937",
        textColor: "#f9fafb",
      },
    },
    options: {
      theme: "light",
      scrollYOffset: 60,
      hideDownloadButton: false,
      disableSearch: false,
      hideHostname: false,
      expandResponses: "200,201",
      requiredPropsFirst: true,
      sortPropsAlphabetically: true,
      showExtensions: true,
      noAutoAuth: false,
      pathInMiddlePanel: true,
      jsonSampleExpandLevel: 2,
      menuToggle: true,
      untrustedSpec: false,
      hideLoading: false,
      suppressWarnings: false,
    },
    redocOptions: {
      nativeScrollbars: false,
      theme: {
        colors: {
          primary: {
            main: "#2563eb",
          },
        },
        typography: {
          fontSize: "14px",
          fontFamily:
            '"Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", sans-serif',
        },
      },
    },
  })
);

// Serve OpenAPI spec as JSON for Redoc
app.get(`${API_PREFIX}/api-docs.json`, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});

/**
 * @swagger
 * /api/system-prompt:
 *   get:
 *     summary: Get the current system prompt
 *     description: Retrieves the current system prompt used by the chatbot
 *     tags:
 *       - System Prompt
 *     responses:
 *       200:
 *         description: System prompt retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 system_prompt:
 *                   type: string
 *                   description: The current system prompt text
 *                   example: "You are a helpful AI assistant..."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch system prompt"
 */

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

/**
 * @swagger
 * /api/v1/system-prompt:
 *   post:
 *     summary: Update the system prompt
 *     description: Updates the system prompt used by the chatbot
 *     tags:
 *       - System Prompt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - system_prompt
 *             properties:
 *               system_prompt:
 *                 type: string
 *                 description: The new system prompt text
 *                 example: "You are a helpful AI assistant specialized in LinkedIn messaging..."
 *     responses:
 *       200:
 *         description: System prompt updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request - missing system_prompt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing system_prompt in request body"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update system prompt"
 */
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

// Unipile configuration
const UNIPILE_BASE_URL = process.env.UNIPILE_BASE_URL;
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

/**
 * @swagger
 * /api/webhook:
 *   post:
 *     summary: LinkedIn webhook endpoint
 *     description: Receives webhook notifications from Unipile for LinkedIn messages and processes them with intelligent responses
 *     tags:
 *       - Webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message_id:
 *                 type: string
 *                 description: Unique identifier for the message
 *                 example: "msg_123456789"
 *               chat_id:
 *                 type: string
 *                 description: Unique identifier for the chat/conversation
 *                 example: "chat_987654321"
 *               account_id:
 *                 type: string
 *                 description: Account identifier from Unipile
 *                 example: "acc_123"
 *               sender:
 *                 type: object
 *                 description: Information about the message sender
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   attendee_name:
 *                     type: string
 *                     example: "John Doe"
 *                   attendee_provider_id:
 *                     type: string
 *                     example: "12345678"
 *               message:
 *                 type: string
 *                 description: The actual message content
 *                 example: "Hello, I'm interested in your services"
 *               timestamp:
 *                 type: string
 *                 description: When the message was sent
 *                 example: "2024-01-15T10:30:00Z"
 *             required:
 *               - message_id
 *               - chat_id
 *               - message
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: ["success", "ignored", "fallback_success", "webhook_received"]
 *                     message:
 *                       type: string
 *                     messageId:
 *                       type: string
 *                     chatId:
 *                       type: string
 *                     threadId:
 *                       type: string
 *                     reply:
 *                       type: string
 *                       description: Truncated response for logging
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: ["ignored"]
 *                     reason:
 *                       type: string
 *                       enum: ["missing_required_data", "already_processed", "own_message", "auto_reply_detected"]
 *                     received:
 *                       type: object
 *                       properties:
 *                         messageId:
 *                           type: string
 *                         chatId:
 *                           type: string
 *                         messageText:
 *                           type: string
 *       500:
 *         description: Internal server error (though returns 200 for webhook compatibility)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Internal processing error"
 */
// Main webhook endpoint
app.post(`${API_PREFIX}/webhook`, async (req, res) => {
  try {
    console.log("\n🔔 Webhook received!");
    console.log("Headers:", req.headers);
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const webhookData = req.body;

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
      (sender.attendee_name.toLowerCase().includes("top-voice.ai") ||
        sender.attendee_name.toLowerCase().includes("lisa green") ||
        sender.attendee_provider_id === "79109442")
    ) {
      console.log("⚠️  Message from our own account, skipping");
      return res.status(200).json({ status: "ignored", reason: "own_message" });
    }

    // Also skip if message text matches our auto-reply (additional safety)
    if (messageText && messageText.trim() === AUTO_REPLY_MESSAGE.trim()) {
      console.log("⚠️  Message matches our auto-reply text, skipping");
      return res
        .status(200)
        .json({ status: "ignored", reason: "auto_reply_detected" });
    }

    // Mark message as processed
    processedMessages.add(messageId);

    // Process the query using LinkedIn chatbot and send intelligent reply
    try {
      console.log(`🤖 Processing LinkedIn query with threadId: ${chatId}`);

      // Use linkedInAgnet to generate intelligent response
      const intelligentResponse = await linkedInAgnet(
        chatId,
        messageText
      );

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
