/* eslint-disable import/prefer-default-export */

import nodemailer from 'nodemailer';

export function register(server, options, next) {
  const transporter = nodemailer.createTransport(options.transport, {
    from: options.sender,
  });

  /**
   * Sends an email.
   */
  function sendMail(mailOptions) {
    return transporter.sendMail(mailOptions);
  }

  server.expose({ transporter, sendMail });
  server.once('stop', () => transporter.close());

  transporter.verify(next);
}

register.attributes = {
  name: 'mailer',
};
