/**
 * @file Music PauseSongCommand - Pauses the currently playing track  
 * You need to be in a voice channel before you can use this command  
 * **Aliases**: `shh`, `shhh`, `shhhh`, `shhhhh`, `hush`, `halt`
 * @module
 * @category music
 * @name pause
 * @returns {Message} Confirmation the music was paused
 */

const {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class PauseSongCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'pause',
      memberName: 'pause',
      group: 'music',
      aliases: ['shh', 'shhh', 'shhhh', 'shhhhh', 'hush', 'halt'],
      description: 'Pauses the currently playing song',
      examples: ['pause'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run (msg) {
    startTyping(msg);
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('I am not playing any music right now, why not get me to start something?');
    }
    if (!queue.songs[0].dispatcher) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('I can\'t pause a song that hasn\'t even begun playing yet.');
    }
    if (!queue.songs[0].playing) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('pauseception is not possible 🤔');
    }
    queue.songs[0].dispatcher.pause();
    queue.songs[0].playing = false;

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`paused the music. Use \`${msg.guild.commandPrefix}resume\` to continue playing.`);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('music:play').queue;
    }

    return this._queue;
  }
};