/**
 * Resend Email Integration Service for CandidateIQ Official Interviews
 */

const sendInterviewInvitationEmail = async (interviewData) => {
  const {
    candidateName,
    candidateEmail,
    jobTitle,
    companyName = 'CandidateIQ Hiring Partner',
    roundTitle = 'Technical Interview',
    scheduledDate,
    scheduledTime,
    timeZone = 'IST (UTC+5:30)',
    durationMinutes = 60,
    meetingUrl,
    candidateInstructions = 'Please arrive 5 minutes prior to the start time with your camera and microphone enabled.'
  } = interviewData;

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'noreply@candidateiq.app';
  const fromName = process.env.EMAIL_FROM_NAME || 'CandidateIQ Interviews';

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
        .badge { background-color: #f3e8ff; color: #7e22ce; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .title { font-size: 22px; font-weight: 800; margin-top: 12px; color: #0f172a; }
        .details-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .btn { display: block; text-align: center; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 700; margin-top: 24px; font-size: 14px; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="badge">${roundTitle}</span>
          <h1 class="title">Interview Invitation: ${jobTitle}</h1>
          <p style="color: #64748b; font-size: 14px;">${companyName}</p>
        </div>

        <p>Dear <strong>${candidateName}</strong>,</p>
        <p>You have been invited for an official recruitment interview session with the hiring team for the position of <strong>${jobTitle}</strong>.</p>

        <div class="details-box">
          <div class="detail-row"><span>Round Type</span><strong>${roundTitle}</strong></div>
          <div class="detail-row"><span>Scheduled Date</span><strong>${scheduledDate}</strong></div>
          <div class="detail-row"><span>Scheduled Time</span><strong>${scheduledTime} (${timeZone})</strong></div>
          <div class="detail-row"><span>Duration</span><strong>${durationMinutes} Minutes</strong></div>
        </div>

        <p><strong>Instructions:</strong> ${candidateInstructions}</p>

        <a href="${meetingUrl}" class="btn">Join Interview Room</a>

        <div class="footer">
          CandidateIQ AI Talent & Interview System &bull; Please do not reply directly to this automated invitation.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!apiKey) {
    console.log('[Resend Email Service] RESEND_API_KEY not configured. Simulated delivery for candidate:', candidateEmail);
    return {
      success: true,
      simulated: true,
      messageId: `sim_msg_${Date.now()}`,
      recipient: candidateEmail
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to: [candidateEmail],
        subject: `Interview Invitation: ${jobTitle} - ${roundTitle}`,
        html: htmlBody
      })
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, messageId: data.id, recipient: candidateEmail };
    } else {
      console.warn('[Resend Email Service] Delivery error response:', data);
      return { success: false, error: data.message || 'Email delivery failed' };
    }
  } catch (err) {
    console.error('[Resend Email Service] Network error sending email:', err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendInterviewInvitationEmail
};
