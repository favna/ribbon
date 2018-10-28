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

import fetch from 'node-fetch';
import moment from 'moment';
import querystring from 'querystring';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

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

      const apple = await fetch(`https://itunes.apple.com/search?${querystring.stringify({
          term: music,
          media: 'music',
          entity: 'song',
          limit: 5,
          lang: 'en_us',
          country: 'US',
          explicit: 'yes'
        }).replace(/%2B/gm, '+')}`),
        tune = await apple.json(),
        song = tune.resultCount >= 1 ? tune.results[0] : null,
        tunesEmbed = new MessageEmbed();

      if (!song) throw new Error('nosong');

      tunesEmbed
        .setThumbnail(song.artworkUrl100)
        .setTitle(song.trackName)
        .setURL(song.trackViewUrl)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .addField('Artist', `[${song.artistName}](${song.artistViewUrl})`, true)
        .addField('Collection', `[${song.collectionName}](${song.collectionViewUrl})`, true)
        .addField('Collection Price (USD)', `$${song.collectionPrice}`, true)
        .addField('Track price (USD)', `$${song.trackPrice}`, true)
        .addField('Track Release Date', moment(song.releaseDate).format('MMMM Do YYYY'), true)
        .addField('# Tracks in Collection', song.trackCount, true)
        .addField('Primary Genre', song.primaryGenreName, true)
        .addField('Preview', `[Click Here](${song.previewUrl})`, true);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(tunesEmbed);
    } catch (err) {
      stopTyping(msg);

      if ((/(?:nosong)/i).test(err.toString())) {
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