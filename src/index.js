/* eslint-disable global-require */

import config from 'config';
import Hapi from 'hapi';
import PouchDB from 'pouchdb';

const server = new Hapi.Server();
const db = new PouchDB('./data/db');

server.connection({ port: 3000 });
server.app.db = db;

const modules = [
  {
    register: require('./modules/mailer'),
    options: config.get('mailer'),
  },
  require('./modules/router'),
  require('./modules/scheduler'),
];

server.register(modules)
  .then(() => server.start())
  .then(() => console.log(`Server listening port ${server.info.port}...`));
