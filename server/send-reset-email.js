import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, link } = req.body;

  if (!email || !link) {
    return res.status(400).json({ error: 'Missing email or link' });
  }

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL, 
    subject: 'Reset Your Password',
    html: `
      <h2>Reset Password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${link}">${link}</a>
    `,
  };

  try {
    await sgMail.send(msg);
    return res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('SendGrid error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}