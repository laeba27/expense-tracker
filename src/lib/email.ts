import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationLink: string
): Promise<void> {
  const mailOptions = {
    from: `"${process.env.NODEMAILER_FROM_NAME}" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: 'Verify Your Email - Expense Tracker',
    html: `
      <h2>Welcome ${name}!</h2>
      <p>Please verify your email to complete your registration.</p>
      <p>Click the link below to verify your email (valid for 15 minutes):</p>
      <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Verify Email
      </a>
      <p style="margin-top: 20px; color: #666;">Or copy and paste this link:</p>
      <p style="color: #666;">${verificationLink}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendLoginEmail(email: string, name: string, loginLink: string): Promise<void> {
  const mailOptions = {
    from: `"${process.env.NODEMAILER_FROM_NAME}" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: 'Login to Expense Tracker',
    html: `
      <h2>Welcome back ${name}!</h2>
      <p>Click the link below to log in:</p>
      <a href="${loginLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Login
      </a>
    `,
  };

  await transporter.sendMail(mailOptions);
}
