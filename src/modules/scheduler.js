/* eslint-disable import/prefer-default-export */

import axios from 'axios';
import cron from 'cron';

export function register(server, options, next) {
  const { db } = server.app;
  const { mailer } = server.plugins;

  /**
   * Checks if the username is available.
   */
  async function isUsernameAvailable(username) {
    const url = `https://passport.twitch.tv/usernames/${username}?users_service=true`;
    const response = await axios.head(url);

    return response.status === 204;
  }

  /**
   * Sends a email notification.
   */
  async function sendNotification(doc) {
    const { username, email } = doc;

    await mailer.sendMail({
      to: email,
      subject: `Twitch username "${username}" available!`,
      text: [
        'Good news!',
        '',
        `The Twitch username "${username}" you are looking for is now available!`,
        'You should go now and claim your brand new username.',
        '',
        'Best regards, Seldszar.',
      ].join('\n'),
    });

    console.log('Email successfully sent, removing the request from the database...');
    db.remove(doc);
  }

  const job = new cron.CronJob({
    cronTime: '* * * * *',
    start: false,
    runOnInit: true,
    async onTick() {
      const result = await db.allDocs({
        include_docs: true,
      });

      result.rows.forEach(async (row) => {
        const { doc } = row;
        const available = await isUsernameAvailable(doc.username);

        if (available) {
          console.log('scheduler', `Username "${doc.username}" is available, sending email...`);
          sendNotification(doc);
        }
      });
    },
  });

  server.once('start', () => job.start());
  server.once('stop', () => job.stop());

  return next();
}

register.attributes = {
  name: 'scheduler',
  dependencies: ['mailer'],
};
