import nodemailer from 'nodemailer';
import {env} from '../config/env.js';

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
