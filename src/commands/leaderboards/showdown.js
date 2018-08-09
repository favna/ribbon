/**
 * @file Leaderboards ShowdownCommand - Show the top ranking players in your tier of choice  
 * **Aliases**: `showdownlb`, `pokelb`
 * @module
 * @category leaderboards
 * @name showdown
 * @example showdown ou
 * @param {StringResolvable} TierName Name of the tier to view the leaderboard for
 * @returns {MessageEmbed} List of top 10 ranking players in given tier
 */

const Fuse = require('fuse.js'),
  fetch = require('node-fetch'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {TierAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {stripIndents} = require('common-tags'),
  {deleteCommandMessages,
    roundNumber,
    stopTyping,
    startTyping} = require('../../components/util.js');

module.exports = class ShowdownCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'showdown',
      memberName: 'showdown',
      group: 'leaderboards',
      aliases: ['showdownlb', 'pokelb'],
      description: 'Show the top ranking players in your tier of choice',
      format: 'TierName',
      examples: ['showdown ou'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'tier',
          prompt: 'Respond with the Showdown tier',
          type: 'string',
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  async run (msg, {tier}) {
    try {
      startTyping(msg);
      const fsoptions = {
          shouldSort: true,
          threshold: 0.6,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['alias']
        },
        fuse = new Fuse(TierAliases, fsoptions),
        results = fuse.search(tier),
        ladders = await fetch(`https://pokemonshowdown.com/ladder/${results[0].tier}.json`),
        json = await ladders.json(),
        data = {
          usernames: json.toplist.map(u => u.username).slice(0, 10),
          wins: json.toplist.map(w => w.w).slice(0, 10),
          losses: json.toplist.map(l => l.l).slice(0, 10),
          elo: json.toplist.map(e => roundNumber(e.elo)).slice(0, 10)
        },
        showdownEmbed = new MessageEmbed();

      showdownEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setThumbnail('https://favna.xyz/images/ribbonhost/showdown.png');

      for (const rank in data.usernames) {
        showdownEmbed.addField(`${parseInt(rank, 10) + 1}: ${data.usernames[rank]}`, stripIndents`
        **Wins**:${data.wins[rank]}
        **Losses**:${data.losses[rank]}
        **ELO**:${data.elo[rank]}
        `, true);
      }

      showdownEmbed.setTitle(`Pokemon Showdown ${results[0].tier} Leaderboard`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(showdownEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.say(stripIndents`
      __**Unknown tier, has to be one of the following**__
      \`\`\`
      ╔════════════════╤══════════╤════════════╗
      ║ random battles │ randdubs │ ou         ║
      ╟────────────────┼──────────┼────────────╢
      ║ uber           │ uu       │ ru         ║
      ╟────────────────┼──────────┼────────────╢
      ║ nu             │ pu       │ lc         ║
      ╟────────────────┼──────────┼────────────╢
      ║ mono           │ ag       │ double     ║
      ╟────────────────┼──────────┼────────────╢
      ║ vgc            │ hackmons │ 1v1        ║
      ╟────────────────┼──────────┼────────────╢
      ║ mega           │ aaa      │ anyability ║
      ╚════════════════╧══════════╧════════════╝
      \`\`\``);
    }
  }
};