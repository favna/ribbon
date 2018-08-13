/**
 * @file Music MaxLengthCommand - Set the maximum length (in minutes) of a video  
 * Give no argument to show current amount of maximum songs  
 * Use "default" as argument to set it back to the bot default  
 * **Aliases**: `max-duration`, `max-song-length`, `max-song-duration`
 * @module
 * @category music
 * @name maxlength
 * @example maxlength 10
 * @param {number/"default"} [MaxVideoLength] New maximum length in minutes
 * @returns {Message} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'),
  {oneLine} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class MaxLengthCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'maxlength',
      memberName: 'maxlength',
      group: 'music',
      aliases: ['max-duration', 'max-song-length', 'max-song-duration'],
      description: 'Shows or sets the max song length.',
      details: oneLine`
            This is the maximum length of a song that users may queue, in minutes.
            The default is ${process.env.MAX_LENGTH}.
            Only administrators may change this setting.`,
      format: '[minutes|"default"]',
      examples: ['maxlength 10'],
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
      const maxLength = msg.guild.settings.get('maxLength', process.env.MAX_LENGTH);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`the maximum length of a song is ${maxLength} minutes.`);
    }

    if (args.toLowerCase() === 'default') {
      msg.guild.settings.remove('maxLength');
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`set the maximum song length to the default (currently ${process.env.MAX_LENGTH} minutes).`);
    }

    const maxLength = parseInt(args, 10);

    if (isNaN(maxLength) || maxLength <= 0) {
      stopTyping(msg);

      return msg.reply('invalid number provided.');
    }

    msg.guild.settings.set('maxLength', maxLength);
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`set the maximum song length to ${maxLength} minutes.`);
  }
};