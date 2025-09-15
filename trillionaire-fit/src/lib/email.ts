import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
};

// Check if email is properly configured
const isEmailConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

// Create transporter only if email is configured
const transporter = isEmailConfigured ? nodemailer.createTransport(emailConfig) : null;

// Verify connection configuration
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email service error:', error);
    } else {
      console.log('✅ Email service ready');
    }
  });
} else {
  console.warn('⚠️ Email service not configured - SMTP_USER and SMTP_PASS are required');
}

// Email templates
export const emailTemplates = {
  passwordReset: (resetLink: string, firstName: string) => ({
    subject: 'Reset Your Password - Trillionaire Fit',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #000; font-size: 28px; margin: 0;">TRILLIONAIRE FIT</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Luxury Fashion & Lifestyle</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #000; margin: 0 0 20px 0;">Password Reset Request</h2>
          <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
            Hello ${firstName},
          </p>
          <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
            We received a request to reset your password for your Trillionaire Fit account. 
            Click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
            This link will expire in 15 minutes for security reasons.
          </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px;">
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>© 2024 Trillionaire Fit. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  orderConfirmation: (order: any, customerName: string) => ({
    subject: `Order Confirmation #${order.orderNumber} - Trillionaire Fit`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #000; font-size: 28px; margin: 0;">TRILLIONAIRE FIT</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Luxury Fashion & Lifestyle</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #000; margin: 0 0 20px 0;">Order Confirmation</h2>
          <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
            Hello ${customerName},
          </p>
          <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for your order! We're excited to prepare your items for delivery.
          </p>
          
          <div style="background: #fff; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="color: #000; margin: 0 0 15px 0;">Order Details</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> #${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₦${order.total.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #059669;">${order.status}</span></p>
          </div>
          
          <div style="background: #fff; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="color: #000; margin: 0 0 15px 0;">Order Items</h3>
            ${order.items.map((item: any) => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                <div>
                  <p style="margin: 0; font-weight: bold;">${item.name}</p>
                  <p style="margin: 0; color: #666; font-size: 14px;">${item.designer}</p>
                  <p style="margin: 0; color: #666; font-size: 14px;">Qty: ${item.quantity}</p>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-weight: bold;">₦${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="background: #fff; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="color: #000; margin: 0 0 15px 0;">Shipping Address</h3>
            <p style="margin: 5px 0;">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.address}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
          </div>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px;">
          <p>You can track your order status in your dashboard.</p>
          <p>© 2024 Trillionaire Fit. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  orderStatusUpdate: (order: any, customerName: string, newStatus: string) => ({
    subject: `Order Update #${order.orderNumber} - ${newStatus} - Trillionaire Fit`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #000; font-size: 28px; margin: 0;">TRILLIONAIRE FIT</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Luxury Fashion & Lifestyle</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #000; margin: 0 0 20px 0;">Order Status Update</h2>
          <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
            Hello ${customerName},
          </p>
          <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
            Your order #${order.orderNumber} status has been updated to: <strong>${newStatus}</strong>
          </p>
          
          ${newStatus === 'shipped' && order.trackingNumber ? `
            <div style="background: #e0f2fe; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #0277bd;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
            </div>
          ` : ''}
          
          ${newStatus === 'delivered' ? `
            <div style="background: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32;"><strong>Your order has been delivered!</strong></p>
              <p style="margin: 5px 0 0 0; color: #2e7d32;">Thank you for shopping with Trillionaire Fit.</p>
            </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px;">
          <p>You can track your order status in your dashboard.</p>
          <p>© 2024 Trillionaire Fit. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  welcomeEmail: (firstName: string) => ({
    subject: 'Welcome to Trillionaire Fit!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #000; font-size: 28px; margin: 0;">TRILLIONAIRE FIT</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Luxury Fashion & Lifestyle</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #000; margin: 0 0 20px 0;">Welcome to Trillionaire Fit!</h2>
          <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
            Hello ${firstName},
          </p>
          <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
            Welcome to the world of luxury fashion! We're thrilled to have you as part of our exclusive community.
          </p>
          <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
            As a member, you'll enjoy:
          </p>
          <ul style="color: #333; line-height: 1.6; margin: 0 0 20px 0; padding-left: 20px;">
            <li>Exclusive access to limited edition collections</li>
            <li>Priority customer support</li>
            <li>Free shipping on orders over ₦50,000</li>
            <li>Early access to sales and new arrivals</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/" 
               style="background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
              Start Shopping
            </a>
          </div>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px;">
          <p>Thank you for choosing Trillionaire Fit!</p>
          <p>© 2024 Trillionaire Fit. All rights reserved.</p>
        </div>
      </div>
    `,
  }),
};

// Email sending functions
export async function sendEmail(to: string, subject: string, html: string) {
  if (!isEmailConfigured || !transporter) {
    console.warn('⚠️ Email not configured - skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: `"Trillionaire Fit" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Specific email functions
export async function sendPasswordResetEmail(email: string, resetToken: string, firstName: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
  const template = emailTemplates.passwordReset(resetLink, firstName);
  return await sendEmail(email, template.subject, template.html);
}

export async function sendOrderConfirmationEmail(email: string, order: any, customerName: string) {
  const template = emailTemplates.orderConfirmation(order, customerName);
  return await sendEmail(email, template.subject, template.html);
}

export async function sendOrderStatusUpdateEmail(email: string, order: any, customerName: string, newStatus: string) {
  const template = emailTemplates.orderStatusUpdate(order, customerName, newStatus);
  return await sendEmail(email, template.subject, template.html);
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  const template = emailTemplates.welcomeEmail(firstName);
  return await sendEmail(email, template.subject, template.html);
}

// Test email function
export async function sendTestEmail(to: string) {
  const testTemplate = {
    subject: 'Test Email - Trillionaire Fit',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000;">Test Email</h1>
        <p>This is a test email from Trillionaire Fit email service.</p>
        <p>If you received this email, the email service is working correctly!</p>
      </div>
    `,
  };
  return await sendEmail(to, testTemplate.subject, testTemplate.html);
}
