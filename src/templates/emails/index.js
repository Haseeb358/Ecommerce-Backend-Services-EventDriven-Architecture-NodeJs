import { otpTemplate } from './otp.template.js';
import { resetPasswordTemplate } from './resetPassword.template.js';
import { orderPlacedTemplate } from './orderPlaced.template.js';

/**
 * Registry: template name -> function(data) => { subject, html, text }
 * To add a new email type: write a template file, add ONE line here.
 */
export const emailTemplates = {
  otp: otpTemplate,
  resetPassword: resetPasswordTemplate,
  orderPlaced: orderPlacedTemplate,
};
