import nodemailer from 'nodemailer';
import {env} from '../config/env.js';
/**
 * Raw SMTP transport for Brevo. This file knows HOW to talk to Brevo
 * and nothing else — no templates, no business rules.
 *
 * Brevo SMTP settings:
 *   SMTP_HOST = smtp-relay.brevo.com
 *   SMTP_PORT = 587
 *   SMTP_USER = your Brevo SMTP login (shown in Brevo > SMTP & API > SMTP)
 *   SMTP_PASS = your Brevo SMTP *key* (not the same as an API key)
 *
 * Port 587 uses STARTTLS, so `secure` must be false (secure:true is for 465).
 */
export function createMailerClient(config) {
  return nodemailer.createTransport({
   host: "smtp-relay.brevo.com",
   port: 587,
   secure: false,
   auth: {
    user: env.BREVO_SMTP_USER,
    pass: env.BREVO_SMTP_PASS,
  }, 
  });
}
