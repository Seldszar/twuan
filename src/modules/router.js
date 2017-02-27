/* eslint-disable import/prefer-default-export */

import Joi from 'joi';

export function register(server, options, next) {
  const { db } = server.app;

  server.route({
    method: 'POST',
    path: '/register',
    config: {
      validate: {
        payload: Joi.object({
          username: Joi.string().token().required(),
          email: Joi.string().email().required(),
        }),
      },
      async handler(request, reply) {
        try {
          const { username, email } = request.payload;

          // TODO: Replace the local query by a global view because, performance-wise, the second
          //       option is faster.
          const result = await db.query((doc, emit) => {
            if (doc.username === username && doc.email === email) {
              emit(doc);
            }
          });

          if (result.total_rows === 0) {
            await db.post({ username, email });
          }

          reply();
        } catch (err) {
          reply(err);
        }
      },
    },
  });

  return next();
}

register.attributes = {
  name: 'router',
};
