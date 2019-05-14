import { config } from 'dotenv';
import fireadmin from 'firebase-admin';
import moduleAlias from 'module-alias';
import path from 'path';
import './data/i18n/i18n';
import Ribbon from './Ribbon';

// Configure dotenv
config({
    path: path.join(__dirname, '.env'),
    encoding: 'utf8',
    debug: false,
});

// Authenticate Firebase-admin
fireadmin.initializeApp({
    credential: fireadmin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT,
        clientEmail: process.env.FIREBASE_EMAIL,
        privateKey: process.env.FIREBASE_KEY,
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT}.firebaseio.com`,
});

// Add module aliases
moduleAlias.addAlias('@components', `${__dirname}/components`);
moduleAlias.addAlias('@pokedex', `${__dirname}/data/dex`);
moduleAlias.addAlias('@i18n', `${__dirname}/data/i18n`);
moduleAlias.addAlias('@databases', `${__dirname}/data/databases`);

// Start the bot
new Ribbon(process.env.NODE_ENV === 'development' ? process.env.TEST_TOKEN! : process.env.BOT_TOKEN!).init();