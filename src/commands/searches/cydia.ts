/**
 * @file Searches CydiaCommand - Gets info from a package on Cydia, only supports default repositories
 *
 * Can also listens to the pattern of `[[SomePackageName]]` as is custom on the [/r/jailbreak
 *     subreddit](https://www.reddit.com/r/jailbreak) and [its discord server](https://discord.gg/jb) Server admins can
 *     enable the `[[]]` matching by using the `rmt off` command
 *
 * **Aliases**: `cy`
 * @module
 * @category searches
 * @name cydia
 * @example cydia Anemone
 * @param {string} TweakName Name of the tweak to find
 */

import { ASSET_BASE_PATH, CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, roundNumber } from '@components/Utils';
import { stringify } from '@favware/querystring';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, TextChannel, User } from 'awesome-djs';
import cheerio from 'cheerio';
import { oneLine, stripIndents } from 'common-tags';
import Fuse, { FuseOptions } from 'fuse.js';
import moment from 'moment';
import fetch from 'node-fetch';
import { CydiaAPIPackageType, CydiaData } from 'RibbonTypes';

type CydiaArgs = {
  deb: string;
  hasManageMessages: boolean;
  position: number;
};

export default class CydiaCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'cydia',
      aliases: [ 'cy' ],
      group: 'searches',
      memberName: 'cydia',
      description: 'Finds info on a Cydia package',
      format: 'PackageName | [[PackageName]]',
      details: stripIndents`
                ${oneLine`
                  Can also listens to the pattern of \`[[SomePackageName]]\`
                  as is custom on the [/r/jailbreak subreddit](https://www.reddit.com/r/jailbreak) and [its discord server](https://discord.gg/jb)`
}
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
      patterns: [ /\[\[[a-zA-Z0-9 ]+]]/im ],
    });
  }

  @clientHasManageMessages()
  public async run(msg: CommandoMessage, { deb, hasManageMessages, position = 0 }: CydiaArgs) {
    try {
      if (msg.patternMatches) {
        if (!msg.guild.settings.get('regexmatches', false)) return null;
        deb = msg.patternMatches[0].substring(2, msg.patternMatches[0].length - 2);
      }

      const baseURL = 'https://cydia.saurik.com/';
      const fsoptions: FuseOptions<CydiaAPIPackageType> = {
        keys: [ 'display', 'name' ],
        threshold: 0.3,
      };
      const res = await fetch(`${baseURL}api/macciti?${stringify({ query: deb })}`);
      const packages = await res.json();
      const fuzzyList = new Fuse(packages.results as CydiaAPIPackageType[], fsoptions);
      const search = fuzzyList.search(deb);
      const color = msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR;

      if (!search.length) throw new Error('no_packages');

      let currentPackage = search[position];
      let packageData = await this.fetchAllData(currentPackage, baseURL);
      let cydiaEmbed = this.prepMessage(
        color, packageData, search.length, position, hasManageMessages
      );

      if (!msg.patternMatches) deleteCommandMessages(msg, this.client);

      const message = await msg.embed(cydiaEmbed) as CommandoMessage;

      if (search.length > 1 && hasManageMessages) {
        injectNavigationEmotes(message);
        new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.two })
          .on('collect', async (reaction: MessageReaction, user: User) => {
            if (!this.client.botIds.includes(user.id)) {
              if (reaction.emoji.name === '➡') position++;
              else position--;
              if (position >= search.length) position = 0;
              if (position < 0) position = search.length - 1;
              currentPackage = search[position];
              packageData = await this.fetchAllData(currentPackage, baseURL);
              cydiaEmbed = this.prepMessage(
                color, packageData, search.length, position, hasManageMessages
              );
              message.edit('', cydiaEmbed);
              message.reactions.get(reaction.emoji.name)!.users.remove(user);
            }
          });
      }

      return null;
    } catch (err) {
      if (/no_packages/i.test(err.toString())) return msg.say(`**Tweak/Theme \`${deb}\` not found!**`);
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`cydia\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Package:** ${deb}
        **Regex Match:** \`${msg.patternMatches ? 'yes' : 'no'}\`
        **Error Message:** ${err}`);

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }

  private async fetchAllData(pkg: CydiaAPIPackageType, baseURL: string): Promise<CydiaData> {
    let source = '';
    let size = '';
    let price = '';
    let section = '';
    let thumbnail = '';

    try {
      const siteReq = await fetch(`${baseURL}package/${pkg.name}`);
      const site = await siteReq.text();
      const $ = cheerio.load(site);

      source = $('.source-name').html()!;
      section = $('#section').html()!;
      size = $('#extra').text();
      thumbnail = `${baseURL}${$('#header > #icon > div > span > img').attr('src').slice(1)}`;
      // eslint-disable-next-line no-empty
    } catch { }

    try {
      const priceReq = await fetch(`${baseURL}api/ibbignerd?${stringify({ query: pkg.name })}`);
      const priceData = await priceReq.json();

      price = priceData ? `$${roundNumber(parseFloat(priceData.msrp.toString()), 2).toFixed(2)}` : 'Free';
      // eslint-disable-next-line no-empty
    } catch { }

    return {
      size,
      price,
      source,
      baseURL,
      section,
      thumbnail,
      name: pkg.name,
      display: pkg.display,
      summary: pkg.summary,
      version: pkg.version,
    };
  }

  private prepMessage(
    color: string, pkg: CydiaData, packagesLength: number,
    position: number, hasManageMessages: boolean
  ): MessageEmbed {
    return new MessageEmbed()
      .setColor(color)
      .setTitle(pkg.display)
      .setDescription(pkg.summary)
      .setThumbnail(pkg.thumbnail ? pkg.thumbnail : `${ASSET_BASE_PATH}/ribbon/cydia.png`)
      .setFooter(hasManageMessages ? `Result ${position + 1} of ${packagesLength}` : '')
      .addField('Version', pkg.version, true)
      .addField('Link',
        `[Click Here](${pkg.baseURL}package/${pkg.name})`,
        true)
      .addField('Section', pkg.section ? pkg.section : 'Unknown', true)
      .addField('Size', pkg.size ? pkg.size : 'Unknown', true)
      .addField('Price', pkg.price ? pkg.price : 'Unknown', true)
      .addField('Source', pkg.source ? pkg.source : 'Unknown', true)
      .addField('Package Name', pkg.name, false);
  }
}