import { config } from 'dotenv';
import fireadmin from 'firebase-admin';
import { KlasaClient } from 'klasa';
import moduleAlias from 'module-alias';
import 'moment-duration-format';
import path from 'path';
import 'reflect-metadata';
import createDatabaseConnection from './components/Typeorm/DbConfig';
import { prod } from './components/Utils';
import createRibbonInstance from './Ribbon';
import 'array-flat-polyfill';

// Add module aliases
moduleAlias.addAlias('@root', `${__dirname}`);
moduleAlias.addAlias('@components', `${__dirname}/components`);
moduleAlias.addAlias('@pokedex', `${__dirname}/data/dex`);
moduleAlias.addAlias('@databases', `${__dirname}/data/databases`);

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

// Setup Klasa settings schema
KlasaClient.defaultGuildSchema
  .add('deleteCommand', 'boolean', { default: false, configurable: true })
  .add('unknownMessages', 'boolean', { default: true, configurable: true })
  .add('saydata', saydatafolder => saydatafolder
    .add('argString', 'string', { default: '', configurable: false })
    .add('authorID', 'string', { default: '', configurable: false })
    .add('authorTag', 'string', { default: '', configurable: true })
    .add('avatarURL', 'string', { default: '', configurable: true })
    .add('commandPrefix', 'string', { default: '', configurable: false })
    .add('memberHexColor', 'string', { default: '', configurable: false })
    .add('messageDate', 'string', { configurable: false })
    .add('attachment', 'string', { default: '', configurable: false })
  )
  .add('automod', automodFolder => automodFolder
    .add('badwords', badwordsfolder => badwordsfolder
      .add('enabled', 'boolean', { default: false, configurable: true })
      .add('words', 'string', { array: true, default: [ 'fuck' ], configurable: true })
    )
    .add('duptext', duptextfolder => duptextfolder
      .add('enabled', 'boolean', { default: false, configurable: true })
      .add('within', 'integer', { default: 3, configurable: true })
      .add('equals', 'integer', { default: 2, configurable: true })
      .add('distance', 'integer', { default: 20, configurable: true })
    )
    .add('caps', capsfolder => capsfolder
      .add('enabled', 'boolean', { default: false, configurable: true })
      .add('threshold', 'integer', { default: 60, configurable: true })
      .add('minLength', 'integer', { default: 10, configurable: true })
    )
    .add('emojis', capsfolder => capsfolder
      .add('enabled', 'boolean', { default: false, configurable: true })
      .add('threshold', 'integer', { default: 5, configurable: true })
      .add('minLength', 'integer', { default: 10, configurable: true })
    )
    .add('mentions', mentionsFolder => mentionsFolder
      .add('enabled', 'boolean', { default: false, configurable: true })
      .add('threshold', 'integer', { default: 5, configurable: true })
    )
    .add('links', 'boolean', { default: false, configurable: true })
    .add('invites', 'boolean', { default: false, configurable: true })
    .add('enabled', 'boolean', { default: false, configurable: true })
    .add('filterRoles', 'role', { array: true, default: [], configurable: true })
  )
  .add('casino', casinoFolder => casinoFolder
    .add('lowerLimit', 'integer', { default: 1, configurable: true })
    .add('upperLimit', 'integer', { default: 10000, configurable: true })
  )
  .add('moderation', moderationFolder => moderationFolder
    .add('announcementsChannel', 'textchannel', { configurable: true })
    .add('defaultRole', 'role', { configurable: true })
    .add('muteRole', 'role', { configurable: true })
    .add('selfRoles', 'role', { array: true, default: [], configurable: true })
    .add('unknownMessages', 'boolean', { default: true, configurable: true })
  )
  .add('automessages', autoMessagesFolder => autoMessagesFolder
    .add('joinmsgs', joinmsgsfolder => joinmsgsfolder
      .add('channel', 'textchannel', { configurable: true })
      .add('enabled', 'boolean', { default: false, configurable: true })
    )
    .add('leavemsgs', leavemsgsfolder => leavemsgsfolder
      .add('channel', 'textchannel', { configurable: true })
      .add('enabled', 'boolean', { default: false, configurable: true })
    )
  )
  .add('logging', loggingFolder => loggingFolder
    .add('memberlogs', memberlogsfolder => memberlogsfolder
      .add('channel', 'textchannel', { configurable: true })
      .add('enabled', 'boolean', { default: false, configurable: true })
    )
    .add('modlogs', modlogsfolder => modlogsfolder
      .add('channel', 'textchannel', { configurable: true })
      .add('enabled', 'boolean', { default: false, configurable: true })
    )
  )
  .add('music', musicFolder => musicFolder
    .add('defaultVolume', 'integer', { default: 3, configurable: true })
    .add('maxLength', 'integer', { default: 10, configurable: true })
    .add('maxSongs', 'integer', { default: 3, configurable: true })
  )
  .add('twitch', twitchFolder => twitchFolder
    .add('channel', 'textchannel', { configurable: true })
    .add('enabled', 'boolean', { configurable: true })
    .add('users', 'user', { array: true, default: [], configurable: true })
  );

// Start the bot
(async () => {
  const token = process.env.NODE_ENV === 'development'
    ? process.env.TEST_TOKEN!
    : process.env.BOT_TOKEN!;
  await Promise.all([ createDatabaseConnection(), createRibbonInstance(token) ]);
})();