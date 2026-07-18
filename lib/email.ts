import { logger } from '@/lib/logger';

export interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
}

export interface AgencyBranding {
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
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

export function renderEmailTemplate({
  title,
  content,
  agency,
  actionUrl,
  actionText,
}: {
  title: string;
  content: string;
  agency?: AgencyBranding;
  actionUrl?: string;
  actionText?: string;
}): string {
  const logoSection = agency?.logoUrl
    ? `<img src="${agency.logoUrl}" alt="${agency.name}" style="max-height: 60px; margin-bottom: 20px;">`
    : '';

  const actionButton = actionUrl && actionText
    ? `<a href="${actionUrl}" style="display: inline-block; background-color: ${agency?.primaryColor || '#0f2822'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px;">${actionText}</a>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${logoSection}
        <div style="background-color: ${agency?.secondaryColor || '#f8f9fa'}; padding: 30px; border-radius: 8px;">
          <h1 style="color: ${agency?.primaryColor || '#0f2822'}; margin-top: 0;">${title}</h1>
          ${content}
          ${actionButton}
        </div>
        ${agency ? `<p style="font-size: 12px; color: #666; margin-top: 20px; text-align: center;">&copy; ${new Date().getFullYear()} ${agency.name}</p>` : ''}
      </body>
    </html>
  `;
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

export async function sendPasswordReset(
  email: string,
  token: string,
  agency?: AgencyBranding
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html: renderEmailTemplate({
      title: 'Reset Your Password',
      content: `
        <p>We received a request to reset your password for your ${agency?.name || 'RealEstate SaaS'} account.</p>
        <p>Click the button below to create a new password:</p>
      `,
      agency,
      actionUrl: resetUrl,
      actionText: 'Reset Password',
    }),
  });
}

export async function sendEmailVerification(
  email: string,
  token: string,
  agency?: AgencyBranding
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    html: renderEmailTemplate({
      title: 'Verify Your Email',
      content: `
        <p>Thank you for signing up with ${agency?.name || 'RealEstate SaaS'}!</p>
        <p>Please verify your email address to complete your registration:</p>
      `,
      agency,
      actionUrl: verifyUrl,
      actionText: 'Verify Email',
    }),
  });
}

export interface VisitConfirmationData {
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  propertyTitle: string;
  propertyLocation: string;
  scheduledAt: string | Date;
  duration?: number;
  agentName?: string;
  agentPhone?: string;
  meetingLink?: string;
}

export async function sendVisitConfirmation(
  email: string,
  data: VisitConfirmationData,
  agency?: AgencyBranding
) {
  const scheduledDate = new Date(data.scheduledAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const durationText = data.duration ? `${data.duration} minutes` : 'TBD';

  const content = `
    <p><strong>Visitor:</strong> ${data.visitorName}</p>
    <p><strong>Email:</strong> ${data.visitorEmail}</p>
    ${data.visitorPhone ? `<p><strong>Phone:</strong> ${data.visitorPhone}</p>` : ''}
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
    <p><strong>Property:</strong> ${data.propertyTitle}</p>
    <p><strong>Location:</strong> ${data.propertyLocation}</p>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
    <p><strong>Date & Time:</strong> ${scheduledDate}</p>
    <p><strong>Duration:</strong> ${durationText}</p>
    ${data.agentName ? `<p><strong>Agent:</strong> ${data.agentName}</p>` : ''}
    ${data.agentPhone ? `<p><strong>Agent Phone:</strong> ${data.agentPhone}</p>` : ''}
    ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
  `;

  await sendEmail({
    to: email,
    subject: `Property Visit Confirmation: ${data.propertyTitle}`,
    html: renderEmailTemplate({
      title: 'Property Visit Scheduled',
      content,
      agency,
    }),
  });
}

export interface SavedSearchAlertData {
  searchName: string;
  properties: Array<{
    id: string;
    title: string;
    location: string;
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    image_url?: string;
  }>;
}

export async function sendSavedSearchAlert(
  email: string,
  data: SavedSearchAlertData,
  agency?: AgencyBranding
) {
  const propertiesHtml = data.properties
    .map(
      (prop) => `
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
        ${prop.image_url ? `<img src="${prop.image_url}" alt="${prop.title}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">` : ''}
        <h3 style="margin-top: 0; margin-bottom: 8px;">${prop.title}</h3>
        <p style="margin: 4px 0; color: #666;">${prop.location}</p>
        <p style="margin: 4px 0; font-weight: bold; color: ${agency?.primaryColor || '#0f2822'};">$${prop.price.toLocaleString()}</p>
        ${prop.bedrooms || prop.bathrooms ? `<p style="margin: 4px 0; font-size: 14px; color: #888;">${prop.bedrooms || 0} beds • ${prop.bathrooms || 0} baths</p>` : ''}
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/properties/${prop.id}" style="display: inline-block; margin-top: 10px; color: ${agency?.primaryColor || '#0f2822'}; text-decoration: none; font-weight: 500;">View Property →</a>
      </div>
    `
    )
    .join('');

  const content = `
    <p>We found new properties matching your saved search <strong>"${data.searchName}"</strong>:</p>
    ${propertiesHtml}
  `;

  await sendEmail({
    to: email,
    subject: `New Properties Found: ${data.searchName}`,
    html: renderEmailTemplate({
      title: `${data.properties.length} New Propert${data.properties.length === 1 ? 'y' : 'ies'} Found!`,
      content,
      agency,
      actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/saved-searches`,
      actionText: 'View All Saved Searches',
    }),
  });
}