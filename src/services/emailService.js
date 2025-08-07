import nodemailer from "nodemailer";

/**
 * Email Service for sending campaign download links
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    // Check if email configuration exists
    const emailConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // Debug logging to check configuration
    console.log("📧 Email Configuration Debug:", {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.auth.user ? "***configured***" : "missing",
      pass: emailConfig.auth.pass ? "***configured***" : "missing",
      env_secure_raw: process.env.SMTP_SECURE,
    });

    // If no email config is provided, use Gmail defaults as fallback
    if (!emailConfig.host) {
      console.log("📧 No SMTP configuration found, using Gmail defaults");
      emailConfig.host = "smtp.gmail.com";
      emailConfig.port = 587;
      emailConfig.secure = false;
    }

    // Add Gmail/Google Workspace specific TLS settings to fix SSL issues
    if (emailConfig.host === "smtp.gmail.com") {
      emailConfig.tls = {
        rejectUnauthorized: false,
        ciphers: "SSLv3",
      };
      emailConfig.requireTLS = true;
      emailConfig.connectionTimeout = 10000;
      emailConfig.greetingTimeout = 5000;
      emailConfig.socketTimeout = 10000;

      // Additional settings for Google Workspace domains
      if (
        emailConfig.auth.user &&
        emailConfig.auth.user.includes("@adgrant.ai")
      ) {
        console.log("📧 Detected Google Workspace domain (adgrant.ai)");
        emailConfig.service = "gmail"; // This helps nodemailer optimize for Gmail/Workspace
      }
    }

    try {
      this.transporter = nodemailer.createTransport(emailConfig);
      this.isConfigured = !!(emailConfig.auth.user && emailConfig.auth.pass);

      if (this.isConfigured) {
        console.log("✅ Email service initialized successfully");
      } else {
        console.log(
          "⚠️ Email service initialized but credentials not configured"
        );
      }
    } catch (error) {
      console.error("❌ Error initializing email service:", error);
      this.isConfigured = false;
    }
  }

  async sendCampaignEmail(leadData, downloadToken, baseUrl) {
    if (!this.isConfigured) {
      console.log("📧 Email not configured, returning mailto link instead");
      return this.generateMailtoLink(leadData, downloadToken, baseUrl);
    }

    try {
      const downloadUrl = `${baseUrl}/api/v1/download/${downloadToken}`;
      const emailHtml = this.generateEmailHTML(leadData, downloadUrl);
      const emailText = this.generateEmailText(leadData, downloadUrl);

      const mailOptions = {
        from: {
          name: "Ad Grant AI",
          address: process.env.SMTP_FROM || process.env.SMTP_USER,
        },
        to: leadData.email,
        subject: `Your Google Ad Grant Campaign Files - ${
          leadData.organizationName || "Campaign"
        } Ready`,
        text: emailText,
        html: emailHtml,
      };

      console.log(`📧 Sending email to: ${leadData.email}`);
      const result = await this.transporter.sendMail(mailOptions);

      console.log("✅ Email sent successfully:", result.messageId);
      return {
        success: true,
        method: "email_sent",
        messageId: result.messageId,
        recipient: leadData.email,
      };
    } catch (error) {
      console.error("❌ Error sending email:", error);
      // Fallback to mailto link
      return this.generateMailtoLink(leadData, downloadToken, baseUrl);
    }
  }

  generateMailtoLink(leadData, downloadToken, baseUrl) {
    const downloadUrl = `${baseUrl}/api/v1/download/${downloadToken}`;
    const subject = `Your Google Ad Grant Campaign Files - ${
      leadData.organizationName || "Campaign"
    } Ready`;
    const body = this.generateEmailText(leadData, downloadUrl);

    const mailtoLink = `mailto:${leadData.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    return {
      success: true,
      method: "mailto_link",
      mailtoLink,
      recipient: leadData.email,
    };
  }

  generateEmailText(leadData, downloadUrl) {
    return `Hi there!

Thank you for using Ad Grant AI to generate your professional Google Ad Grant campaigns.

DOWNLOAD LINK: ${downloadUrl}

WHAT YOU'LL GET:
✅ Complete Google Ads Editor CSV files
✅ Professional campaign structure with 2 ad groups per campaign
✅ 25 high-volume keywords per ad group  
✅ 2 responsive search ads per ad group
✅ $320 daily budget distribution
✅ CPA bidding strategy setup

NEXT STEPS:
1. Download Google Ads Editor (free from Google)
2. Import the CSV files in this order: Campaigns → Ad Groups → Keywords → Ads
3. Review and launch your campaigns

CAMPAIGN DETAILS:
${leadData.websiteUrl ? `Website: ${leadData.websiteUrl}` : ""}
Campaign ID: ${leadData.campaignId}
Generated: ${new Date().toLocaleDateString()}

Need help? Reply to this email and we'll assist you with setup.

Best regards,
The Ad Grant AI Team

---
This link expires in 24 hours for security. Download your files promptly.`;
  }

  generateEmailHTML(leadData, downloadUrl) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Ad Grant Campaigns Are Ready!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 40px 30px; }
        .download-section { background-color: #f8f9fa; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
        .download-button { display: inline-block; background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; transition: transform 0.2s; }
        .download-button:hover { transform: translateY(-2px); }
        .features { list-style: none; padding: 0; }
        .features li { padding: 8px 0; position: relative; padding-left: 30px; }
        .features li:before { content: '✅'; position: absolute; left: 0; }
        .steps { background-color: #e3f2fd; border-radius: 12px; padding: 25px; margin: 25px 0; }
        .steps h3 { color: #1976d2; margin-top: 0; }
        .steps ol { margin: 15px 0; }
        .details { background-color: #f1f3f4; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .details h4 { margin-top: 0; color: #5f6368; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #5f6368; font-size: 14px; }
        .warning { background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
        .warning p { margin: 0; color: #e65100; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your Google Ad Grant Campaigns Are Ready!</h1>
            <p>Professional campaigns generated just for ${
              leadData.organizationName || "your organization"
            }</p>
        </div>
        
        <div class="content">
            <p>Hi there!</p>
            <p>Thank you for using Ad Grant AI to generate your professional Google Ad Grant campaigns. Your campaigns have been successfully created and are ready for download.</p>
            
            <div class="download-section">
                <h3>📥 Download Your Campaign Files</h3>
                <a href="${downloadUrl}" class="download-button">Download Campaign Files</a>
                <p style="margin-top: 15px; color: #666; font-size: 14px;">Click the button above to download your complete campaign package</p>
            </div>
            
            <h3>What You'll Get:</h3>
            <ul class="features">
                <li>Complete Google Ads Editor CSV files</li>
                <li>Professional campaign structure with 2 ad groups per campaign</li>
                <li>25 high-volume keywords per ad group</li>
                <li>2 responsive search ads per ad group</li>
                <li>$320 daily budget distribution</li>
                <li>CPA bidding strategy setup</li>
            </ul>
            
            <div class="steps">
                <h3>🚀 Next Steps:</h3>
                <ol>
                    <li><strong>Download Google Ads Editor</strong> (free from Google)</li>
                    <li><strong>Import the CSV files</strong> in this order: Campaigns → Ad Groups → Keywords → Ads</li>
                    <li><strong>Review and launch</strong> your campaigns</li>
                </ol>
            </div>
            
            <div class="details">
                <h4>📊 Campaign Details:</h4>
                ${
                  leadData.websiteUrl
                    ? `<p><strong>Website:</strong> ${leadData.websiteUrl}</p>`
                    : ""
                }
                <p><strong>Campaign ID:</strong> ${leadData.campaignId}</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="warning">
                <p><strong>⏰ Important:</strong> This download link expires in 24 hours for security. Please download your files promptly.</p>
            </div>
            
            <p>Need help with setup? Simply reply to this email and we'll assist you with the implementation.</p>
            
            <p>Best regards,<br><strong>The Ad Grant AI Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent because you requested Google Ad Grant campaigns from Ad Grant AI.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>
    </div>
</body>
</html>`;
  }

  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, message: "Email service not configured" };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: "Email service connection successful" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
