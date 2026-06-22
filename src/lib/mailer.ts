import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? "465"),
      secure: process.env.SMTP_SECURE !== "false",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { rejectUnauthorized: false },
    });
  }
  return transporter;
}

export async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST) {
    console.warn(`[mailer] SMTP non configuré — email à ${to} ignoré`);
    return;
  }
  const t = getTransporter();
  await t.sendMail({
    from: process.env.SMTP_FROM ?? `"Prospecto" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
