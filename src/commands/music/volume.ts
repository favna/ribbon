/**
 * @file Music ChangeVolumeCommand - Changes the volume of the currently playing song  
 * If you do not give any parameter, Ribbon will show the current volume  
 * You need to be in a voice channel before you can use this command  
 * **Aliases**: `set-volume`, `set-vol`, `vol`
 * @module
 * @category music
 * @name volume
 * @example volume 2
 * @param {Number} [Volume] The new volume to set
 */

import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class ChangeVolumeCommand extends Command {
  private songQueue: any;
  constructor (client: CommandoClient) {
    super(client, {
      name: 'volume',
      aliases: [ 'set-volume', 'set-vol', 'vol' ],
      group: 'music',
      memberName: 'volume',
      description: 'Changes the volume.',
      format: '[level]',
      details: 'The volume level ranges from 0-10. You may specify "up" or "down" to modify the volume level by 2.',
      examples: [ 'volume', 'volume 7', 'volume up', 'volume down' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  public run (msg: CommandoMessage, args: any) {
    startTyping(msg);
    const queue = this.queue.get(msg.guild.id);
    let volume = null;

    if (!queue) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('there isn\'t any music playing to change the volume of. Better queue some up!');
    }
    if (!args) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`the dial is currently set to ${queue.volume}.`);
    }
    if (!queue.voiceChannel.members.has(msg.author.id)) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('you\'re not in the voice channel. You better not be trying to mess with their mojo, man.');
    }

    if (isNaN(volume)) {
      volume = args.toLowerCase();
      if (volume === 'up' || volume === '+') {
        volume = queue.volume + 2;
      } else if (volume === 'down' || volume === '-') {
        volume = queue.volume - 2;
      } else {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply('invalid volume level. The dial goes from 0-10, baby.');
      }
    }

    volume = Number(args);
    volume = Math.min(Math.max(volume, 0), volume === 11 ? 11 : 10);
    queue.volume = volume;
    if (queue.songs[0].dispatcher) {
        queue.songs[0].dispatcher.setVolumeLogarithmic(queue.volume / 5);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`${volume === 11 ? 'this one goes to 11!' : `set the dial to ${volume}.`}`);
  }

  get queue () {
    if (!this.songQueue) {
      // @ts-ignore
      this.songQueue = this.client.registry.resolveCommand('music:play').queue;
    }

    return this.songQueue;
  }
}