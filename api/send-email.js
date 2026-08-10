const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ status: 'error', message: 'Please fill in all fields.' });
  }

  // Set up Nodemailer transporter using Hostinger SMTP settings
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // true for port 465
    auth: {
      user: 'hello@webforme.in',
      pass: 'Tanisha_$06',
    },
  });

  const mailOptions = {
    from: '"Contact Form" <hello@webforme.in>',
    to: 'hello@webforme.in',
    replyTo: email,
    subject: `New Contact Form Submission from ${name}`,
    text: `You have received a new message from your website contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      status: 'success',
      message: 'Thank you! Your message has been sent successfully.'
    });
  } catch (error) {
    console.error('SMTP Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Could not send message. Please contact us directly at hello@webforme.in',
      debug: error.message
    });
  }
};
