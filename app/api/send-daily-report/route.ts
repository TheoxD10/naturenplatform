import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { calculateAllShowroomsMetrics } from '@/lib/dailyMetrics.server';
import { generateDailyReportEmail, generateDailyReportEmailPlainText } from '@/lib/emailTemplate';
import { getEmailRecipients, updateLastSentTimestamp } from '@/lib/emailConfig.server';
import { logActivityServer } from '@/lib/activity.server';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isTest = body.isTest === true;

    const recipients = await getEmailRecipients();
    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients configured' }, { status: 400 });
    }

    const metrics = await calculateAllShowroomsMetrics();
    const htmlContent = generateDailyReportEmail(metrics);
    const textContent = generateDailyReportEmailPlainText(metrics);

    const dateStr = new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' });
    const subject = isTest ? `[TEST] Raport Zilnic Showroom - ${dateStr}` : `Raport Zilnic Showroom - ${dateStr}`;

    const results = await Promise.allSettled(
      recipients.map(recipient =>
        transporter.sendMail({
          from: `"Showroom Reports" <${process.env.GMAIL_USER}>`,
          to: recipient.email,
          subject,
          html: htmlContent,
          text: textContent
        })
      )
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;

    if (!isTest && successCount > 0) await updateLastSentTimestamp();

    if (successCount > 0) {
      await logActivityServer(
        'email_sent', 'system', 'System', process.env.GMAIL_USER || 'system',
        `${isTest ? 'Test email' : 'Daily report'} sent to ${successCount} recipient(s)`,
        { emailTo: recipients.map(r => r.email).join(', '), recipientCount: successCount, isTest }
      );
    }

    return NextResponse.json({ success: true, message: `Email sent to ${successCount} of ${recipients.length} recipients`, isTest });
  } catch (error) {
    console.error('Error sending daily report:', error);
    return NextResponse.json({ error: 'Failed to send daily report', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-cron-secret');
    const querySecret = request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET || 'your-secret-key-here';

    if (authHeader !== expectedSecret && querySecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recipients = await getEmailRecipients();
    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients configured' }, { status: 400 });
    }

    const metrics = await calculateAllShowroomsMetrics();
    const dateStr = new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' });

    const results = await Promise.allSettled(
      recipients.map(recipient =>
        transporter.sendMail({
          from: `"Showroom Reports" <${process.env.GMAIL_USER}>`,
          to: recipient.email,
          subject: `Raport Zilnic Showroom - ${dateStr}`,
          html: generateDailyReportEmail(metrics),
          text: generateDailyReportEmailPlainText(metrics)
        })
      )
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    if (successCount > 0) await updateLastSentTimestamp();

    return NextResponse.json({ success: true, message: `Email sent to ${successCount} of ${recipients.length} recipients` });
  } catch (error) {
    console.error('Error sending daily report via GET:', error);
    return NextResponse.json({ error: 'Failed to send daily report', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
