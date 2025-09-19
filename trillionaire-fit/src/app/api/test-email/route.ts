import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail, sendOrderConfirmationEmail } from '@/lib/email';

// POST /api/test-email - Test email functionality
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type = 'test' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    let result;
    
    switch (type) {
      case 'password-reset':
        // Test password reset email
        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=test-token-123`;
        result = await sendPasswordResetEmail(email, resetLink, 'Test User');
        break;
        
      case 'order-confirmation':
        // Test order confirmation email
        const mockOrder = {
          orderNumber: 'TF-TEST-123',
          total: 150000,
          status: 'confirmed',
          createdAt: new Date(),
          items: [
            {
              name: 'Test Product',
              designer: 'Test Designer',
              quantity: 1,
              price: 150000,
              image: '/placeholder.jpg'
            }
          ],
          shippingAddress: {
            firstName: 'Test',
            lastName: 'User',
            email: email,
            phone: '+2341234567890',
            address: '123 Test Street',
            city: 'Lagos',
            state: 'Lagos',
            postalCode: '100001',
            country: 'Nigeria'
          }
        };
        result = await sendOrderConfirmationEmail(email, mockOrder, 'Test User');
        break;
        
      default:
        // Test simple email
        result = await sendTestEmail(email);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type} email sent successfully to ${email}`,
        type: type
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send email', 
          details: result.error 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simple test email function
async function sendTestEmail(email: string) {
  const nodemailer = await import('nodemailer');
  
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  };

  if (!emailConfig.auth) {
    return {
      success: false,
      error: 'Email service not configured. Please set SMTP_USER and SMTP_PASS environment variables.'
    };
  }

  const transporter = nodemailer.createTransport(emailConfig);

  try {
    await transporter.sendMail({
      from: `"Trillionaire Fit" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🧪 Email Test - Trillionaire Fit',
      html: `
        <div style="font-family: 'Cormorant Garamond', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; font-size: 28px; margin: 0; font-family: 'Playfair Display', serif; font-weight: 700;">TRILLIONAIRE FIT</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Luxury Fashion & Lifestyle</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #000; margin: 0 0 20px 0;">✅ Email Test Successful!</h2>
            <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
              Congratulations! Your email service is working perfectly.
            </p>
            <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">
              This test email was sent from your Trillionaire Fit application at ${new Date().toLocaleString()}.
            </p>
            <div style="background: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #2d5a2d; margin: 0; font-weight: bold;">🎉 Email Configuration Status: ACTIVE</p>
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p>This is a test email from Trillionaire Fit</p>
            <p>If you received this, your email notifications are ready to go!</p>
          </div>
        </div>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
