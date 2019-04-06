import { config } from 'dotenv';
import fireadmin from 'firebase-admin';
import 'module-alias/register';
import path from 'path';
import Ribbon from './Ribbon';

config({
    path: path.join(__dirname, '.env'),
    encoding: 'utf8',
    debug: false,
});

fireadmin.initializeApp({
    credential: fireadmin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT,
        clientEmail: process.env.FIREBASE_EMAIL,
        privateKey: process.env.FIREBASE_KEY,
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT}.firebaseio.com`,
});

(() => new Ribbon(process.env.NODE_ENV === 'development' ? process.env.TEST_TOKEN! : process.env.BOT_TOKEN!).init())();