const nodemailer = require('nodemailer');

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, 
      },
    });

    const now = new Date();
    const formattedDateTime = now.toISOString().replace('T', ' ').substring(0, 19);

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Welcome to News Aggregator Newsletter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Welcome to News Aggregator!</h2>
          <p>Hello,</p>
          <p>Thank you for subscribing to our newsletter on ${formattedDateTime}. You'll now receive regular updates with the latest news and articles tailored to your interests.</p>
          <h3>What to expect:</h3>
          <ul>
            <li>Daily news summaries</li>
            <li>Weekly featured articles</li>
            <li>Breaking news alerts</li>
            <li>Personalized content recommendations</li>
          </ul>
          <p>We're excited to have you join our community!</p>
          <p>Best regards,<br>The News Aggregator Team</p>
          <p style="font-size: 12px; color: #6B7280; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 10px;">
            This email was sent to ${email}. If you did not request this subscription, please disregard this email.
          </p>
        </div>
      `
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email sending error:', error);
          reject(error);
        } else {
          console.log('Email sent:', info.response);
          resolve(info);
        }
      });
    });

    res.status(200).json({ message: 'Subscription successful! Check your email for confirmation.' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ message: 'Failed to process subscription. Please try again later.' });
  }
};