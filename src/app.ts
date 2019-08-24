import { config } from 'dotenv';
import fireadmin from 'firebase-admin';
import moduleAlias from 'module-alias';
import path from 'path';
import Ribbon from './Ribbon';
import 'reflect-metadata';
import 'moment-duration-format';
import createDatabaseConnection from './components/Typeorm/DbConfig';
import { prod } from './components/Utils';

// Configure dotenv
config({
  path: path.join(__dirname, '.env'),
  encoding: 'utf8',
  debug: false,
});

fireadmin.initializeApp({
  credential: fireadmin.credential.cert({
    projectId: prod ? process.env.FIREBASE_PROJECT : process.env.DEV_FIREBASE_PROJECT,
    clientEmail: prod ? process.env.FIREBASE_EMAIL : process.env.DEV_FIREBASE_EMAIL,
    privateKey: prod ? process.env.FIREBASE_KEY : process.env.DEV_FIREBASE_KEY,
  }),
  databaseURL: `https://${prod ? process.env.FIREBASE_PROJECT : process.env.DEV_FIREBASE_PROJECT}.firebaseio.com`,
});

// Add module aliases
moduleAlias.addAlias('@components', `${__dirname}/components`);
moduleAlias.addAlias('@pokedex', `${__dirname}/data/dex`);
moduleAlias.addAlias('@databases', `${__dirname}/data/databases`);

// Start the bot
(async () => {
  await createDatabaseConnection();
  await new Ribbon(process.env.NODE_ENV === 'development' ? process.env.TEST_TOKEN! : process.env.BOT_TOKEN!).init();
})();