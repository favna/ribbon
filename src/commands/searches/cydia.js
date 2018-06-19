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

const Fuse = require('fuse.js'),
  cheerio = require('cheerio'),
  moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

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
          prompt: 'Please supply package name',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {deb}) {
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
      packages = await request.get(`${baseURL}api/macciti`).query('query', deb);

    if (packages.ok) {
      const fuse = new Fuse(packages.body.results, fsoptions),
        results = fuse.search(deb);

      if (results.length) {
        const result = results[0];

        embed
          .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
          .setTitle(result.display)
          .setDescription(result.summary)
          .addField('Version', result.version, true)
          .addField('Link', `[Click Here](${baseURL}package/${result.name})`, true);

        try {
          const price = await request.get(`${baseURL}api/ibbignerd`).query('query', result.name),
            site = await request.get(`${baseURL}package/${result.name}`);

          if (site.ok) {
            const $ = cheerio.load(site.body.toString());

            embed
              .addField('Source', $('.source-name').html(), true)
              .addField('Section', $('#section').html(), true)
              .addField('Size', $('#extra').text(), true);
          }

          if (price.ok) {
            embed.addField('Price', price.body ? `$${price.body.msrp}` : 'Free', true);
          }

          embed.addField('Package Name', result.name, false);

          if (!msg.patternMatches) {
            deleteCommandMessages(msg, this.client);
          }
          stopTyping(msg);

          return msg.embed(embed);
        } catch (err) {
          this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
          <@${this.client.owners[0].id}> Error occurred in \`cydia\` command!
          **Server:** ${msg.guild.name} (${msg.guild.id})
          **Author:** ${msg.author.tag} (${msg.author.id})
          **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Input:** ${deb}
          **Regex Match:** \`${msg.patternMatches ? 'yes' : 'no'}\`
          **Error Message:** ${err}
          `);
  
          embed.addField('Package Name', result.name, false);

          if (!msg.patternMatches) {
            deleteCommandMessages(msg, this.client);
          }
          stopTyping(msg);

          return msg.embed(embed);
        }
      }
    }

    return msg.say(`**Tweak/Theme \`${deb}\` not found!**`);
  }
};