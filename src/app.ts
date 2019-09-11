import 'array-flat-polyfill';
import { config } from 'dotenv';
import fireadmin from 'firebase-admin';
import moduleAlias from 'module-alias';
import 'moment-duration-format';
import path from 'path';
import 'reflect-metadata';
import RibbonClient from './lib/RibbonClient';
import { prod } from './lib/utils/Utils';

// Add module aliases
moduleAlias.addAlias('@databases', `${__dirname}/lib/databases`);
moduleAlias.addAlias('@dex', `${__dirname}/lib/dex`);
moduleAlias.addAlias('@extensions', `${__dirname}/lib/extensions`);
moduleAlias.addAlias('@settings', `${__dirname}/lib/typings/settings`);
moduleAlias.addAlias('@structures', `${__dirname}/lib/structures`);
moduleAlias.addAlias('@typeorm', `${__dirname}/lib/typeorm`);
moduleAlias.addAlias('@typings', `${__dirname}/lib/typings`);
moduleAlias.addAlias('@utils', `${__dirname}/lib/utils`);

// Configure dotenv
config({
  path: path.join(__dirname, '.env'),
  encoding: 'utf8',
  debug: false,
});


// Initialize Firebase connection
fireadmin.initializeApp({
  credential: fireadmin.credential.cert({
    projectId: prod ? process.env.FIREBASE_PROJECT : process.env.DEV_FIREBASE_PROJECT,
    clientEmail: prod ? process.env.FIREBASE_EMAIL : process.env.DEV_FIREBASE_EMAIL,
    privateKey: prod ? process.env.FIREBASE_KEY : process.env.DEV_FIREBASE_KEY,
  }),
  databaseURL: `https://${prod ? process.env.FIREBASE_PROJECT : process.env.DEV_FIREBASE_PROJECT}.firebaseio.com`,
});

// Start the bot
const token = process.env.NODE_ENV === 'development' ? process.env.TEST_TOKEN! : process.env.BOT_TOKEN!;
const client = new RibbonClient();
client.login(token);