/**
 * @file Automod BadWordsCommand - Toggle the bad words filter  
 * Please note that when adding new words to your server's filter you overwrite all your currently set words!  
 * **Aliases**: `badwordsfilter`, `bwf`, `bwf`
 * @module
 * @category automod
 * @name badwords
 * @example badwords enable
 * @param {BooleanResolvable} Option True or False
 * @returns {MessageEmbed} Bad words filter confirmation log
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class BadWordsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'badwords',
      memberName: 'badwords',
      group: 'automod',
      aliases: ['badwordsfilter', 'bwf', 'bwf'],
      description: 'Toggle the bad words filter',
      details: 'Please note that when adding new words to your server\'s filter you overwrite all your currently set words!',
      format: 'BooleanResolvable',
      examples: ['badwords enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable the bad words filter?',
          type: 'boolean',
          validate: (bool) => {
            const validBools = ['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+', 'false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-'];

            if (validBools.includes(bool.toLowerCase())) {
              return true;
            }

            return stripIndents`Has to be one of ${validBools.map(val => `\`${val}\``).join(', ')}
            Respond with your new selection or`;
          }
        },
        {
          key: 'words',
          prompt: 'What words to filter (split on every `,`, for example `fbomb,darn`)?',
          type: 'string',
          validate: (val) => {
            if ((/([\S ]*,[\S ]*)*/i).test(val) && val.split(',').length >= 1) {
              return true;
            }

            return 'You need at least 1 word and the valid format is `word,word,word`, for example `fbomb,darn`';
          },
          default: 'fuck'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES');
  }

  run (msg, {option, words}) {
    startTyping(msg);
    words = words.split(',');

    const bwfEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      options = {
        enabled: option,
        words
      };

    msg.guild.settings.set('badwords', options);
    bwfEmbed
      .setColor('#439DFF')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`**Action:** Bad words filter has been ${option ? 'enabled' : 'disabled'}
      ${option ? `**Words:** Bad words have been set to ${words.map(word => `\`${word}\``).join(', ')}` : ''}
      ${!msg.guild.settings.get('automod', false) ? `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
              (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
              This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: bwfEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(bwfEmbed);
  }
};