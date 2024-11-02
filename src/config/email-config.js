import dotenv from 'dotenv';
dotenv.config();

export const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  dailyEmailLimit: parseInt(process.env.DAILY_EMAIL_LIMIT),
  delayBetweenEmails: parseInt(process.env.DELAY_BETWEEN_EMAILS)
}; 