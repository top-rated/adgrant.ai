import express from "express";
import cors from "cors";
import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import bodyParser from "body-parser";
import { UnipileClient } from "unipile-node-sdk";

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
const API_PREFIX = process.env.API_V1_PREFIX;

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Google Ad Grant Generator API",
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
