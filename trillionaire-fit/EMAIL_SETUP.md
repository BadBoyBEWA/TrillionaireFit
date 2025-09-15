# 📧 Email Service Setup Guide

This guide will help you set up email notifications for your Trillionaire Fit e-commerce website.

## 🔧 Environment Variables

Add these variables to your `.env.local` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Base URL (for email links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 📧 Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "Trillionaire Fit" as the name
6. Copy the generated 16-character password
7. Use this password as `SMTP_PASS` in your `.env.local`

### Step 3: Update Environment Variables
```env
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-app-password
```

## 🚀 Alternative Email Services

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-login
SMTP_PASS=your-mailgun-smtp-password
```

## 🧪 Testing Email Service

### Method 1: Admin Dashboard Test
1. Log in as admin
2. Go to `/admin/dashboard`
3. Use the email test feature (if available)

### Method 2: API Test
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"email": "test@example.com", "type": "test"}'
```

### Method 3: Test Password Reset
1. Go to `/forgot-password`
2. Enter a valid email address
3. Check your email for the reset link

## 📨 Email Templates Available

### 1. Password Reset
- **Trigger**: User requests password reset
- **Template**: Professional design with reset button
- **Expiry**: 15 minutes

### 2. Order Confirmation
- **Trigger**: Order is created successfully
- **Template**: Order details, items, shipping address
- **Includes**: Order number, total, status

### 3. Order Status Updates
- **Trigger**: Order status changes (shipped, delivered, etc.)
- **Template**: Status-specific messaging
- **Includes**: Tracking number (if shipped)

### 4. Welcome Email
- **Trigger**: New user registration
- **Template**: Welcome message with benefits
- **Includes**: Call-to-action to start shopping

## 🔍 Troubleshooting

### Common Issues

#### 1. "Invalid login" Error
- **Cause**: Wrong SMTP credentials
- **Solution**: Verify `SMTP_USER` and `SMTP_PASS`
- **Gmail**: Use App Password, not regular password

#### 2. "Connection timeout" Error
- **Cause**: Firewall or network issues
- **Solution**: Check if port 587 is blocked
- **Alternative**: Try port 465 with `SMTP_SECURE=true`

#### 3. "Authentication failed" Error
- **Cause**: 2FA not enabled or wrong app password
- **Solution**: Enable 2FA and generate new app password

#### 4. Emails not received
- **Cause**: Check spam folder
- **Solution**: Add sender to contacts
- **Gmail**: Check "Promotions" tab

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will log email sending attempts to the console.

## 📊 Email Analytics (Optional)

For production, consider integrating:
- **SendGrid**: Built-in analytics
- **Mailgun**: Detailed delivery reports
- **AWS SES**: CloudWatch metrics

## 🔒 Security Best Practices

1. **Never commit SMTP credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate app passwords** regularly
4. **Monitor email sending** for abuse
5. **Implement rate limiting** for email endpoints

## 🚀 Production Deployment

### Environment Variables for Production
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Monitoring
- Set up email delivery monitoring
- Monitor bounce rates
- Track open rates (if using tracking)

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Test with a simple email first
4. Check your email service provider's documentation

---

**Note**: This email service is configured for development and production use. Make sure to test thoroughly before deploying to production.
