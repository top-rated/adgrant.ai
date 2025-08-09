import dotenv from "dotenv";
dotenv.config();

import { leadManager } from "./src/utils/leadManager.js";
import { emailService } from "./src/services/emailService.js";

console.log("🧪 Testing Email Download Flow\n");

async function testEmailDownload() {
  try {
    // Get the existing lead
    const existingLead = leadManager.findByEmail("raheesahmed256@gmail.com");

    if (!existingLead) {
      console.log("❌ No existing lead found for raheesahmed256@gmail.com");
      console.log("📋 Available leads:");
      const allLeads = leadManager.loadLeads();
      allLeads.forEach((lead) => {
        console.log(`   - ${lead.email} (ID: ${lead.id})`);
      });
      return;
    }

    console.log("✅ Found existing lead:");
    console.log(`   Email: ${existingLead.email}`);
    console.log(`   ID: ${existingLead.id}`);
    console.log(`   Campaign: ${existingLead.campaignId}`);
    console.log(`   Organization: ${existingLead.organizationName}`);
    console.log(`   Website: ${existingLead.websiteUrl}\n`);

    // Generate a new download token
    const newToken = leadManager.generateDownloadToken(
      existingLead.id,
      existingLead.campaignId
    );
    console.log("🎟️ Generated new download token:");
    console.log(`   Token: ${newToken}`);
    console.log(`   Length: ${newToken.length} characters\n`);

    // Test token validation
    console.log("🔍 Testing token validation...");
    const validation = leadManager.validateDownloadToken(newToken);
    if (validation) {
      console.log("✅ Token validation successful:");
      console.log(`   Lead ID: ${validation.leadId}`);
      console.log(`   Campaign ID: ${validation.campaignId}`);
      console.log(
        `   Timestamp: ${new Date(validation.timestamp).toLocaleString()}\n`
      );
    } else {
      console.log("❌ Token validation failed\n");
      return;
    }

    // Test local download URL
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const downloadUrl = `${baseUrl}/api/v1/download/${newToken}`;
    console.log("🌐 Download URLs:");
    console.log(`   Local: http://localhost:3000/api/v1/download/${newToken}`);
    console.log(
      `   Production: https://adgrant.ai/api/v1/download/${newToken}\n`
    );

    // Re-initialize email service to pick up environment variables
    emailService.init();

    // Send test email
    console.log("📧 Sending test email...");
    const emailResult = await emailService.sendCampaignEmail(
      existingLead,
      newToken,
      "https://adgrant.ai" // Use production URL for email (without /api/v1)
    );

    console.log("📬 Email result:");
    console.log(`   Success: ${emailResult.success}`);
    console.log(`   Method: ${emailResult.method}`);
    if (emailResult.messageId) {
      console.log(`   Message ID: ${emailResult.messageId}`);
    }
    if (emailResult.mailtoLink) {
      console.log(`   Mailto link available: Yes`);
    }

    console.log("\n✅ Test completed! Check your email inbox.");
    console.log("🔗 You can also test the download directly:");
    console.log(`   curl "${downloadUrl}"`);
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testEmailDownload();
