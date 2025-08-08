# 📧 Email Service Setup Guide

## Current Issue

Your lead capture is working, but emails aren't being sent because Gmail authentication is failing:

```
❌ Error sending email: Invalid login: 535-5.7.8 Username and Password not accepted
```

## Root Cause

The `.env` file has a placeholder password:

```
SMTP_PASS=your_workspace_app_password_here  # ← This needs to be real!
```

## Solutions (Choose One)

### Option 1: Google Workspace App Password (Recommended)

#### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with your `noreply@adgrant.ai` account
3. Enable 2-Factor Authentication if not already enabled

#### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (custom name)"
3. Enter "Ad Grant AI" as the app name
4. Copy the generated 16-character password (like: `abcd efgh ijkl mnop`)

#### Step 3: Update .env File

Replace this line in your `.env`:

```bash
SMTP_PASS=your_workspace_app_password_here
```

With your actual app password:

```bash
SMTP_PASS=abcd efgh ijkl mnop
```

### Option 2: OAuth2 Authentication (Most Secure)

This requires more setup but is the most secure option. Let me know if you want me to implement OAuth2.

### Option 3: Use Mailto Links (Current Fallback)

Your system already falls back to mailto links when email fails. This is working but requires manual email sending.

## Quick Test

After setting up the app password, restart your application and test:

```bash
# Test the email service
curl -X POST http://localhost:3000/api/v1/capture-lead \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "organizationName": "Test Org", "consent": true}'
```

## Current Workaround

Since your app is already handling email failures gracefully, users still get their download links via:

1. **Immediate Response**: The API returns the download token immediately
2. **Mailto Fallback**: If email fails, system generates mailto links
3. **Working Downloads**: The download endpoint works regardless of email status

## Files That Handle This

- ✅ `src/services/emailService.js` - Already has fallback logic
- ✅ `src/index.js` - Lead capture works without email
- ✅ Your system continues working even with email issues

## Production Recommendations

1. **Set up App Password**: Follow Option 1 above
2. **Monitor Email Status**: Check logs for email delivery success
3. **Consider SendGrid/AWS SES**: For high-volume production use
4. **Keep Mailto Fallback**: It's a good backup mechanism

Your system is currently functional - users can still get their campaign files even without working email!
