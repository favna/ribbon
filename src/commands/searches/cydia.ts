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
 */

import * as cheerio from 'cheerio';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as Fuse from 'fuse.js';
import * as moment from 'moment';
import fetch from 'node-fetch';
import { stringify } from '../../components/querystring';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class CydiaCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'cydia',
      aliases: [ 'cy' ],
      group: 'searches',
      memberName: 'cydia',
      description: 'Finds info on a Cydia package',
      format: 'PackageName | [[PackageName]]',
      details: stripIndents`${oneLine`Can also listens to the pattern of \`[[SomePackageName]]\`
        as is custom on the [/r/jailbreak subreddit](https://www.reddit.com/r/jailbreak) and [its discord server](https://discord.gg/jb)`}
        Server admins can enable the \`[[]]\` matching by using the \`rmt on\` command`,
      examples: [ 'cydia anemone' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'deb',
          prompt: 'What package do you want to find on Cydia?',
          type: 'string',
        }
      ],
      patterns: [ /\[\[[a-zA-Z0-9 ]+\]\]/im ],
    });
  }

  public async run (msg: CommandoMessage, { deb }: {deb: string}) {
    try {
      startTyping(msg);
      if (msg.patternMatches) {
        if (!msg.guild.settings.get('regexmatches', false)) {
          return null;
        }
        deb = msg.patternMatches[0].substring(2, msg.patternMatches[0].length - 2);
      }

      const baseURL = 'https://cydia.saurik.com/';
      const cydiaEmbed = new MessageEmbed();
      const fsoptions: Fuse.FuseOptions<any> = {
          shouldSort: true,
          keys: [
            {name: 'display', getfn: t => t.display, weight: 0.8},
            {name: 'name', getfn: t => t.name, weight: 1}
          ],
          location: 0,
          distance: 100,
          threshold: 0.3,
          maxPatternLength: 32,
          minMatchCharLength: 1,
        };
      const res = await fetch(`${baseURL}api/macciti?${stringify({ query: deb })}`);
      const packages = await res.json();
      const fuzzyList = new Fuse(packages.results, fsoptions);
      const search = fuzzyList.search(deb);

      if (!search.length) throw new Error('noPackages');

      cydiaEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(search[0].display)
        .setDescription(search[0].summary)
        .addField('Version', search[0].version, true)
        .addField('Link', `[Click Here](${baseURL}package/${search[0].name})`, true);

      try {
        const siteReq = await fetch(`${baseURL}package/${search[0].name}`);
        const site = await siteReq.text();
        const $ = cheerio.load(site);

        cydiaEmbed
          .addField('Source', $('.source-name').html(), true)
          .addField('Section', $('#section').html(), true)
          .addField('Size', $('#extra').text(), true)
          .setThumbnail(`${baseURL}${$('#header > #icon > div > span > img').attr('src').slice(1)}`);
      } catch {
        // Intentionally empty
      }

      try {
        const priceReq = await fetch(`${baseURL}api/ibbignerd?${stringify({ query: search[0].name })}`);
        const price = await priceReq.json();

        cydiaEmbed.addField('Price', price ? price.msrp : 'Free', true);
      } catch (priceErr) {
        // Intentionally empty
      }

      cydiaEmbed.addField('Package Name', search[0].name, false);

      if (!msg.patternMatches) {
        deleteCommandMessages(msg, this.client);
      }
      stopTyping(msg);

      return msg.embed(cydiaEmbed);
    } catch (err) {
      stopTyping(msg);

      if ((/(noPackages)/i).test(err.toString())) {
        return msg.say(`**Tweak/Theme \`${deb}\` not found!**`);
      }
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

      channel.send(stripIndents`
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
}