/**
 * EmailService = the "what to send" layer. It receives its dependencies
 * (mailer transport, logger, config, templates) through the constructor
 * — nothing is imported directly, so tests can pass fakes.
 */
export class EmailService {
  #mailer;
  #logger;
  #from;
  #templates;

  constructor({ mailer, logger, from, templates }) {
    this.#mailer = mailer;
    this.#logger = logger;
    this.#from = from;
    this.#templates = templates;
  }

  /** Low-level send. Everything else builds on this. */
  async send({ to, subject, html, text }) {
    const info = await this.#mailer.sendMail({
      from: this.#from,
      to,
      subject,
      html,
      text,
    });
    this.#logger.info(`Email sent to ${to} (${subject}) id=${info.messageId}`);
    return info;
  }

  /**
   * Dynamic send: pick a template by name, fill it with data, send it.
   *   emailService.sendTemplate('otp', 'a@b.com', { name, otp })
   */
  async sendTemplate(templateName, to, data) {
    const build = this.#templates[templateName];
    if (!build) {
      throw new Error(`Unknown email template: "${templateName}"`);
    }
    const { subject, html, text } = build(data);
    return this.send({ to, subject, html, text });
  }
}
