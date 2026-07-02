import { logger } from '@/lib/logger';

export interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn('Email not sent - RESEND_API_KEY not configured', { to: options.to });
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/v1/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from ?? 'onboarding@resend.dev',
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('Email send failed', { error });
      return false;
    }

    return true;
  } catch (err) {
    logger.error('Email send error', { error: (err as Error).message });
    return false;
  }
}

export async function sendInquiryNotification(agencyEmail: string, inquiry: { name: string; email: string; phone: string; message: string }) {
  await sendEmail({
    to: agencyEmail,
    subject: 'New Property Inquiry',
    html: `
      <h2>New Inquiry Received</h2>
      <p><strong>Name:</strong> ${inquiry.name}</p>
      <p><strong>Email:</strong> ${inquiry.email}</p>
      <p><strong>Phone:</strong> ${inquiry.phone}</p>
      <p><strong>Message:</strong> ${inquiry.message}</p>
    `,
  });
}

export async function sendWelcomeEmail(email: string, agencyName: string) {
  await sendEmail({
    to: email,
    subject: 'Welcome to RealEstate SaaS!',
    html: `
      <h2>Welcome to RealEstate SaaS!</h2>
      <p>Your agency <strong>${agencyName}</strong> is ready to go.</p>
      <p>Start listing your properties and collecting inquiries.</p>
    `,
  });
}