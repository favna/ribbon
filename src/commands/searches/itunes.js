/**
 * @file Searches iTunesCommand - Search iTunes for music tracks  
 * **Aliases**: `apple`, `tunes`
 * @module
 * @category searches
 * @name itunes
 * @example itunes dash berlin symphony
 * @param {StringResolvable} TrackQuery The music track to look up
 * @returns {MessageEmbed} Information about the music track
 */

const moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class iTunesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'itunes',
      memberName: 'itunes',
      group: 'searches',
      aliases: ['apple', 'tunes'],
      description: 'Search iTunes for music tracks',
      examples: ['itunes dash berlin symphony'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'music',
          prompt: 'What track should I search on iTunes?',
          type: 'string',
          parse: p => p.replace(/ /gm, '+')
        }
      ]
    });
  }

  async run (msg, {music}) {
    try {
      startTyping(msg);

      const tunes = await request
          .get('https://itunes.apple.com/search', {
            qs: {
              stringify: obj => Object.keys(obj).map((k) => {
                const key = `${encodeURIComponent(k)}=`,
                  val = encodeURIComponent(obj[k]).replace(/%2B/gm, '+');

                return key + val;
              }).filter(Boolean).join('&'),
              parse: null
            }
          })
          .query('term', music)
          .query('media', 'music')
          .query('entity', 'song')
          .query('limit', 5)
          .query('lang', 'en_us')
          .query('country', 'US')
          .query('explicit', 'yes'),
        tunesEmbed = new MessageEmbed(),
        hit = JSON.parse(tunes.body).results[0]; // eslint-disable-line sort-vars

      if (!hit) {
        throw new Error('no song found');
      }

      tunesEmbed
        .setThumbnail(hit.artworkUrl100)
        .setTitle(hit.trackName)
        .setURL(hit.trackViewUrl)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .addField('Artist', `[${hit.artistName}](${hit.artistViewUrl})`, true)
        .addField('Collection', `[${hit.collectionName}](${hit.collectionViewUrl})`, true)
        .addField('Collection Price (USD)', `$${hit.collectionPrice}`, true)
        .addField('Track price (USD)', `$${hit.trackPrice}`, true)
        .addField('Track Release Date', moment(hit.releaseDate).format('MMMM Do YYYY'), true)
        .addField('# Tracks in Collection', hit.trackCount, true)
        .addField('Primary Genre', hit.primaryGenreName, true)
        .addField('Preview', `[Click Here](${hit.previewUrl})`, true);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(tunesEmbed);
    } catch (err) {
      stopTyping(msg);

      if (/(?:no song found)/i.test(err.toString())) {
        return msg.reply(`no song found for \`${music.replace(/\+/g, ' ')}\``);
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
    <@${this.client.owners[0].id}> Error occurred in \`itunes\` command!
    **Server:** ${msg.guild.name} (${msg.guild.id})
    **Author:** ${msg.author.tag} (${msg.author.id})
    **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
    **Input:** ${music}
    **Error Message:** ${err}
    `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};