/**
 * @file Extra Say - Repeats a message and deletes your message  
 * **Aliases**: `sayd`, `repeat`
 * @module
 * @category extra
 * @name say
 * @example say Favna is a great coder!
 * @param {StringResolvable} Text Message you want to have repeated
 * @returns {Message} Your message said by the bot
 */

const path = require('path'),
  {Command} = require('discord.js-commando'),
  {stopTyping, startTyping} = require(path.join(__dirname, '../../components/util.js')),
  {badwords, duptext, caps, emojis, mentions, links, invites} = require(path.join(__dirname, '../../components/automod.js'));

module.exports = class SayCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'say',
      memberName: 'say',
      group: 'extra',
      aliases: ['sayd', 'repeat'],
      description: 'I will repeat your message',
      format: 'MessageToSay',
      examples: ['say Favna is a great coder!'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'txt',
          prompt: 'What should I say?',
          type: 'string',
          validate: (rep, msg) => {
            if (msg.content.toLowerCase().includes('@here') ||
            msg.content.toLowerCase().includes('@everyone') ||
            msg.cleanContent.toLowerCase().includes('@here') ||
            msg.cleanContent.toLowerCase().includes('@everyone')) {
              if (msg.deletable) {
                msg.delete();
              }

              return 'You cannot make me mention `@here` or `@everyone`! Would you like me to say anything else?';
            }

            return true;
          }
        }
      ]
    });
  }

  run (msg, {txt}) {
    if (msg.guild && msg.deletable && msg.guild.settings.get('automod', false)) {
      /* eslint-disable curly, max-len*/
      if (msg.guild.settings.get('caps', false).enabled) {
        const opts = msg.guild.settings.get('caps');

        if (caps(msg, opts.threshold, opts.minlength, this.client)) return msg.reply(`you cannot use \`${msg.guild.commandPrefix}say\` to bypass the no excessive capitals filter`);
      }
      if (msg.guild.settings.get('duptext', false).enabled) {
        const opts = msg.guild.settings.get('duptext');

        if (duptext(msg, opts.within, opts.equals, opts.distance, this.client)) return msg.reply(`you cannot use \`${msg.guild.commandPrefix}say\` to bypass the no duplicate text filter`);
      }
      if (msg.guild.settings.get('emojis', false).enabled) {
        const opts = msg.guild.settings.get('emojis');

        if (emojis(msg, opts.threshold, opts.minlength, this.client)) return msg.reply(`you cannot use \`${msg.guild.commandPrefix}say\` to bypass the no excessive emojis filter`);
      }
      if (msg.guild.settings.get('badwords', false).enabled && badwords(msg, msg.guild.settings.get('badwords').words, this.client)) return msg.reply(`you cannot use \`${msg.guild.commandPrefix}say\` to bypass the no bad words filter`);
      if (msg.guild.settings.get('invites', false) && invites(msg, this.client)) return msg.reply(`you cannot use \`${msg.guild.commandPrefix}say\` to bypass the no server invites filter`);
      if (msg.guild.settings.get('links', false) && links(msg, this.client)) return msg.reply(`you cannot use \`${msg.guild.commandPrefix}say\` to bypass the no external links filter`);
      if (msg.guild.settings.get('mentions', false).enabled && mentions(msg, msg.guild.settings.get('mentions').threshold, this.client)) return msg.reply(`you cannot use \`${msg.guild.commandPrefix}say\` to bypass the no excessive mentions filter`);
      /* eslint-enable curly, max-len */
    }

    startTyping(msg);

    const saydata = {
      memberHexColor: msg.member.displayHexColor,
      commandPrefix: msg.guild.commandPrefix,
      authorTag: msg.author.tag,
      authorID: msg.author.id,
      avatarURL: msg.author.displayAvatarURL({format: 'png'}),
      messageDate: msg.createdAt,
      argString: msg.argString.slice(1)
    };

    if (msg.deletable) {
      msg.delete();
    }

    msg.guild.settings.set('saydata', saydata);
    stopTyping(msg);

    return msg.say(txt);
  }
};