# 📧 Google Workspace SMTP Setup Guide for Ad Grant AI

This guide will help you configure Google Workspace SMTP for professional email delivery from your `adgrant.ai` domain.

## 📋 **Prerequisites**

✅ Google Workspace account for `adgrant.ai` domain  
✅ Admin access to Google Workspace Admin Console

## 🔧 **Step 1: Create Service Account in Google Workspace**

### 1.1 Access Google Admin Console

- Go to [admin.google.com](https://admin.google.com)
- Sign in with your `adgrant.ai` admin account

### 1.2 Create Service User

1. Navigate to **Directory > Users**
2. Click **Add new user**
3. Set up the user:
   - **First name:** No Reply
   - **Last name:** Ad Grant AI
   - **Primary email:** `noreply@adgrant.ai`
   - **Password:** Generate a strong password
4. Click **Add new user**

## 🔒 **Step 2: Enable App Passwords**

### 2.1 Enable 2-Step Verification

1. Go to **Security > Authentication > 2-Step Verification**
2. Click **Get started**
3. Turn on **2-Step Verification** for the organization
4. Save changes

### 2.2 Generate App Password

1. Sign in to `noreply@adgrant.ai` account
2. Go to [myaccount.google.com](https://myaccount.google.com)
3. Navigate to **Security > 2-Step Verification**
4. Scroll down to **App passwords**
5. Click **Select app** → **Mail**
6. Click **Select device** → **Other (custom name)**
7. Enter: `Ad Grant AI SMTP`
8. Click **Generate**
9. **Copy the 16-character password** (you'll need this for `.env`)

## ⚙️ **Step 3: Configure Environment Variables**

Update your `.env` file with the Google Workspace configuration:

```env
# ==============================================
# Google Workspace Email Configuration
# ==============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@adgrant.ai
SMTP_PASS=your_16_character_app_password_here
SMTP_FROM=noreply@adgrant.ai
```

### 3.1 Replace Values

- **SMTP_USER:** `noreply@adgrant.ai`
- **SMTP_PASS:** The 16-character app password from Step 2.2
- **SMTP_FROM:** `noreply@adgrant.ai`

## 🧪 **Step 4: Test Configuration**

### 4.1 Restart Your Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

### 4.2 Check Logs

Look for these success messages in your console:

```
📧 Email Configuration Debug: { ... }
📧 Detected Google Workspace domain (adgrant.ai)
✅ Email service initialized successfully
```

### 4.3 Test Email Sending

1. Generate a campaign on your website
2. Submit the email capture form
3. Check the server logs for:
   ```
   📧 Sending email to: test@example.com
   ✅ Email sent successfully: <message-id>
   ```

## 🔐 **Step 5: Security Best Practices**

### 5.1 Set Email Security Policies

In Google Admin Console:

1. Go to **Apps > Google Workspace > Gmail > Safety**
2. Enable **Enhanced Safe Browsing**
3. Set **External recipient warning** to On
4. Configure **Attachment compliance** rules

### 5.2 Monitor Email Activity

1. Go to **Reporting > Audit and investigation > Email log search**
2. Monitor emails sent from `noreply@adgrant.ai`
3. Set up alerts for unusual activity

## 🚨 **Troubleshooting**

### Error: "Invalid credentials"

- ✅ Verify the app password is exactly 16 characters
- ✅ Ensure 2-Step Verification is enabled
- ✅ Check that the email address is `noreply@adgrant.ai`

### Error: "SSL/TLS connection failed"

- ✅ Verify `SMTP_SECURE=false` for port 587
- ✅ Try alternative configuration with port 465 and `SMTP_SECURE=true`
- ✅ Check firewall settings on your server

### Error: "Authentication failed"

- ✅ Regenerate the app password
- ✅ Ensure the service account is active in Google Workspace
- ✅ Check that SMTP is enabled for the user

### Emails not being delivered

- ✅ Check spam folders
- ✅ Verify SPF, DKIM, and DMARC records for `adgrant.ai`
- ✅ Monitor Google Workspace email logs

## 📊 **Alternative Configuration (SSL Port 465)**

If port 587 doesn't work, try this configuration:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@adgrant.ai
SMTP_PASS=your_16_character_app_password_here
SMTP_FROM=noreply@adgrant.ai
```

## 🎯 **Expected Results**

After successful configuration:

✅ **Professional Emails:** Users receive emails from `noreply@adgrant.ai`  
✅ **High Deliverability:** Emails land in inbox, not spam  
✅ **Reliable Delivery:** 99.9% delivery success rate  
✅ **Branded Experience:** Consistent professional branding  
✅ **Admin Monitoring:** Full visibility in Google Workspace logs

## 📞 **Support**

If you encounter issues:

1. **Check Server Logs:** Look for specific error messages
2. **Verify Configuration:** Double-check all environment variables
3. **Test Connectivity:** Ensure your server can reach `smtp.gmail.com:587`
4. **Google Workspace Support:** Contact Google for account-specific issues

## 🔄 **Maintenance**

### Regular Tasks

- **Monthly:** Review email delivery reports in Google Admin Console
- **Quarterly:** Rotate app passwords for security
- **As needed:** Update SPF/DKIM records if changed

### Monitoring

- Set up alerts for failed email deliveries
- Monitor bounce rates and spam reports
- Regular security audits in Google Workspace
