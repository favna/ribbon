/**
 * @file Music MaxSongsCommand- The maximum amount of songs any member can queue  
 * Give no argument to show current amount of maximum songs  
 * Use "default" as argument to set it back to Ribbon's default  
 * **Aliases**: `songcap`, `songmax`, `maxsong`
 * @module
 * @category music
 * @name maxsongs
 * @example maxsongs 2
 * @param {number/"default"} [NumberOfSongs] New maximum number of songs
 * @returns {Message} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'),
  {oneLine} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class MaxSongsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'maxsongs',
      memberName: 'maxsongs',
      group: 'music',
      aliases: ['songcap', 'songmax', 'maxsong'],
      description: 'Shows or sets the max songs per user.',
      details: oneLine`
            This is the maximum number of songs a user may have in the queue.
            The default is ${process.env.MAX_SONGS}.
            Only administrators may change this setting.`,
      format: '[amount|"default"]',
      examples: ['maxsongs 3'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      userPermissions: ['ADMINISTRATOR']
    });
  }

  run (msg, args) {
    startTyping(msg);
    if (!args) {
      const maxSongs = msg.guild.settings.get('maxSongs', process.env.MAX_SONGS);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`the maximum songs a user may have in the queue at one time is ${maxSongs}.`);
    }

    if (args.toLowerCase() === 'default') {
      msg.guild.settings.remove('maxSongs');
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`set the maximum songs to the default (currently ${process.env.MAX_SONGS}).`);
    }

    const maxSongs = parseInt(args, 10);

    if (isNaN(maxSongs) || maxSongs <= 0) {
      stopTyping(msg);

      return msg.reply('invalid number provided.');
    }

    msg.guild.settings.set('maxSongs', maxSongs);
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`set the maximum songs to ${maxSongs}.`);
  }
};