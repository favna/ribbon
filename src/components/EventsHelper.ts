/* eslint-disable no-console */
/* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position*/
import { KlasaClient, Command, KlasaMessage } from 'klasa';
import FirebaseStorage from './FirebaseStorage';
import { setCommandsData, getChannelsData, getCommandsData, getMessagesData, getServersData, getUsersData, setUptimeData } from './FirebaseActions';
import { isTextChannel, prod } from './Utils';
import moment from 'moment';
import { stripIndents, oneLine } from 'common-tags';
import { isString } from 'util';
import fs from 'fs';
import path from 'path';
import interval from 'interval-promise';
import { decache } from './Decache';

export const postUptimeToFirebase = async (client: KlasaClient) => {
  try {
    const uptime = moment.duration(process.uptime() * 1000).format('D [days], H [hours] [and] m [minutes]');
    setUptimeData(uptime);
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!);

    if (channel && isTextChannel(channel) && client.owner) {
      channel.send(stripIndents(
        `
        <@${client.owner.id}> Failed to update Firebase uptime data!
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}
        `
      ));
    }
  }
};

export const handleCommandRun = (client: KlasaClient, msg: KlasaMessage, command: Command) => {
  try {
    if (command.category === 'owner') return;

    let commandsCount = FirebaseStorage.commands;
    commandsCount++;

    FirebaseStorage.commands = commandsCount;
    setCommandsData(String(commandsCount));
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!);

    if (channel && isTextChannel(channel) && isTextChannel(msg.channel) && client.owner && msg.guild) {
      channel.send(stripIndents(
        `
          <@${client.owner.id}> Failed to update Firebase commands count!
          **Message ID:** (${msg.id})
          **Channel Data:** ${msg.channel.name} (${msg.channel.id})
          **Guild Data:** ${msg.guild.name} (${msg.guild.id})
          **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Error Message:** ${err}
        `
      ));
    }
  }
};

export const handleDebug = (info: string | object) => {
  if (!prod) {
    if (isString(info)) {
      return console.info(info);
    }
    console.error('Woaw I went into debug with info of type object, better check it out m8. Here\'s the info I got: ', info);
  }

  return undefined;
};

export const handleErr = (client: KlasaClient, err: Error) => {
  if (prod) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!);

    if (channel && isTextChannel(channel)) {
      return channel.send(stripIndents(
        `
          Caught **WebSocket Error**!
          **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Error Message:** ${err.message}
        `
      ));
    }
  }

  return console.error(stripIndents(
    `
      Caught **WebSocket Error**!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err.message}
    `
  ));
};

export const handleWarn = (client: KlasaClient, warn: string) => {
  const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!);

  if (prod && channel && isTextChannel(channel)) {
    return channel.send(stripIndents(
      `
        Caught **General Warning**!
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Warning Message:** ${warn}
      `
    ));
  }

  return console.warn(warn);
};

export const handleRejection = (reason: Error | unknown, promise: Promise<unknown>) => {
  if (reason instanceof Error) reason = reason.message;

  console.error(stripIndents(
    `
      Caught **Unhandled Rejection **!
      **At:** ${promise}
      **Reason:** ${reason}
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
    `
  ));
};

export const handleReady = async (client: KlasaClient) => {
  FirebaseStorage.channels = parseInt(await getChannelsData());
  FirebaseStorage.commands = parseInt(await getCommandsData());
  FirebaseStorage.messages = parseInt(await getMessagesData());
  FirebaseStorage.servers = parseInt(await getServersData());
  FirebaseStorage.users = parseInt(await getUsersData());

  if (prod) {
    // const everyMinute = 1 * 60 * 1000;
    const everyThreeMinutes = 3 * 60 * 1000;
    // const everyThirdHour = 3 * 60 * 60 * 1000;

    interval(async () => postUptimeToFirebase(client), everyThreeMinutes);
    // interval(async () => sendTimedMessages(client), everyMinute);
    // interval(async () => sendCountdownMessages(client), everyThreeMinutes);
    // interval(async () => sendReminderMessages(client), everyMinute);
    // interval(async () => payoutLotto(client), everyThirdHour);
  }

  fs.watch(path.join(__dirname, '../data/dex/formats.json'),
    (eventType, filename) => {
      if (filename) {
        decache(path.join(__dirname, '../data/dex/formats.json'));
        // client.registry.resolveCommand('pokemon:dex').reload();
      }
    });

  if (client.user) {
    console.info(oneLine(
      `
        Client ready at ${moment().format('HH:mm:ss')};
        logged in as ${client.user.tag} (${client.user.id})
      `
    ));
  }
};