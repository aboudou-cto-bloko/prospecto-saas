import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import React from "react";

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

export async function sendMail(to: string, subject: string, template: React.ReactElement) {
  if (!process.env.SMTP_HOST) {
    console.warn(`[mailer] SMTP non configuré — email à ${to} ignoré`);
    return;
  }
  const html = await render(template);
  const text = await render(template, { plainText: true });
  const t = getTransporter();
  await t.sendMail({
    from: process.env.SMTP_FROM ?? `"Prospecto" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  });
}
