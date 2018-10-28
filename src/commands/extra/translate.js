/**
 * @file Extra TranslateCommand - Translate any word from any language to any other language  
 * Language specifications can be either 1 or 2 letter ISO 639 or full names  
 * **Aliases**: `tr`
 * @module
 * @category extra
 * @name translate
 * @example translate en nl Hello World
 * @param {StringResolvable} FromLanguage The language to translate from
 * @param {StringResolvable} ToLanguage The language to translate to
 * @param {StringResolvable} Text The word or text to translate
 * @returns {MessageEmbed} The input and output of the translation
 */

import moment from 'moment';
import translate from 'translate';
import unescape from 'unescape-es6';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class TranslateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'translate',
      memberName: 'translate',
      group: 'extra',
      aliases: ['tr'],
      description: 'Translate any word from any language to any other language',
      details: 'Language specifications can be either 1 or 2 letter ISO 639 or full names',
      format: 'FromLanguage ToLanguage Text',
      examples: ['translate en nl Hello World'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'fromlang',
          prompt: 'Translate from which language?',
          type: 'string'
        },
        {
          key: 'tolang',
          prompt: 'Translate to which language?',
          type: 'string'
        },
        {
          key: 'text',
          prompt: 'Translate what?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {fromlang, tolang, text}) {
    try {
      startTyping(msg);
      translate.engine = 'google';
      translate.key = process.env.googleapikey;

      const transEmbed = new MessageEmbed(),
        translation = await translate(text, {
          from: fromlang,
          to: tolang
        });

      transEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(`__Translating from ${fromlang.toUpperCase()} to ${tolang.toUpperCase()}__`)
        .setDescription(stripIndents`
        \`${text}\`
        
        \`${unescape(translation)}\``);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(transEmbed);
    } catch (err) {
      stopTyping(msg);
      if ((/(?:not part of the ISO 639)/i).test(err.toString())) {
        return msg.reply('either your from language or to language was not recognized. Please use ISO 639-1 codes for the languages (<https://en.wikipedia.org/wiki/ISO_639-1>)');
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`translate\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **From Language** ${fromlang}
      **To Language** ${tolang}
      **Text** ${text}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};