/**
 * @file Searches CydiaCommand - Gets info from a package on Cydia, only supports default repositories  
 * Can also listens to the pattern of `[[SomePackageName]]` as is custom on the [/r/jailbreak subreddit](https://www.reddit.com/r/jailbreak) and [its discord server](https://discord.gg/jb)  
 * Server admins can enable the `[[]]` matching by using the `rmt off` command  
 * **Aliases**: `cy`
 * @module
 * @category searches
 * @name cydia
 * @example cydia Anemone
 * @param {StringResolvable} TweakName Name of the tweak to find
 * @returns {MessageEmbed} Information about the tweak
 */

import Fuse from 'fuse.js';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import moment from 'moment';
import querystring from 'querystring';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class CydiaCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'cydia',
      memberName: 'cydia',
      group: 'searches',
      aliases: ['cy'],
      description: 'Finds info on a Cydia package',
      details: stripIndents`${oneLine`Can also listens to the pattern of \`[[SomePackageName]]\`
        as is custom on the [/r/jailbreak subreddit](https://www.reddit.com/r/jailbreak) and [its discord server](https://discord.gg/jb)`}
        Server admins can enable the \`[[]]\` matching by using the \`rmt on\` command`,
      format: 'PackageName | [[PackageName]]',
      examples: ['cydia anemone'],
      guildOnly: false,
      patterns: [/\[\[[a-zA-Z0-9 ]+\]\]/im],
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'deb',
          prompt: 'What package do you want to find on Cydia?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {deb}) {
    try {
      startTyping(msg);
      if (msg.patternMatches) {
        if (!msg.guild.settings.get('regexmatches', false)) {
          return null;
        }
        deb = msg.patternMatches[0].substring(2, msg.patternMatches[0].length - 2);
      }

      const baseURL = 'https://cydia.saurik.com/',
        embed = new MessageEmbed(),
        fsoptions = {
          shouldSort: true,
          threshold: 0.3,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['display', 'name']
        },
        res = await fetch(`${baseURL}api/macciti?${querystring.stringify({query: deb})}`),
        packages = await res.json(),
        fuzzyList = new Fuse(packages.results, fsoptions),
        search = fuzzyList.search(deb);

      if (!search.length) throw new Error('noPackages');

      embed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(search[0].display)
        .setDescription(search[0].summary)
        .addField('Version', search[0].version, true)
        .addField('Link', `[Click Here](${baseURL}package/${search[0].name})`, true);

      try {
        const siteReq = await fetch(`${baseURL}package/${search[0].name}`),
          site = await siteReq.text(),
          $ = cheerio.load(site);

        embed
          .addField('Source', $('.source-name').html(), true)
          .addField('Section', $('#section').html(), true)
          .addField('Size', $('#extra').text(), true)
          .setThumbnail(`${baseURL}${$('#header > #icon > div > span > img').attr('src').slice(1)}`);
      } catch (siteErr) {
        null;
      }

      try {
        const priceReq = await fetch(`${baseURL}api/ibbignerd?${querystring.stringify({query: search[0].name})}`),
          price = await priceReq.json();

        embed.addField('Price', price ? price.msrp : 'Free', true);
      } catch (priceErr) {
        null;
      }

      embed.addField('Package Name', search[0].name, false);

      if (!msg.patternMatches) {
        deleteCommandMessages(msg, this.client);
      }
      stopTyping(msg);

      return msg.embed(embed);
    } catch (err) {
      stopTyping(msg);

      if ((/(noPackages)/i).test(err.toString())) {
        return msg.say(`**Tweak/Theme \`${deb}\` not found!**`);
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`cydia\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Package:** ${deb}
      **Regex Match:** \`${msg.patternMatches ? 'yes' : 'no'}\`
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};