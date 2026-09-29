import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const smtpFrom =
  process.env.SMTP_FROM ??
  `Moodify <${smtpUser ?? "noreply@moodify.app"}>`;

if (!smtpHost) {
  throw new Error("SMTP_HOST is not configured.");
}

if (!smtpUser) {
  throw new Error("SMTP_USER is not configured.");
}

if (!smtpPassword) {
  throw new Error("SMTP_PASSWORD is not configured.");
}

export const mailer = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,

  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },

  pool: true,

  maxConnections: 3,

  maxMessages: 100,

  connectionTimeout: 10_000,

  greetingTimeout: 10_000,

  socketTimeout: 20_000,
});

export type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailOptions) {
  if (!to.trim()) {
    throw new Error("Email recipient is required.");
  }

  const result = await mailer.sendMail({
    from: smtpFrom,
    to: to.trim(),
    subject,
    text,
    html,
  });

  return result;
}

export async function verifyEmailConnection() {
  await mailer.verify();

  return true;
}