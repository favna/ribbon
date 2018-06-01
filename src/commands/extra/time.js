/**
 * @file Extra Time - Gets the current time in any place  
 * Uses Google's Geocoding to determine the correct location therefore supports any location indication, country, city or even as exact as a street.  
 * **Aliases**: `citytime`
 * @module
 * @category extra
 * @name time
 * @example time Amsterdam
 * @param {StringResolvable} Location Place where you want to get the current time for
 * @returns {MessageEmbed} Current date, current time, country and DST offset
 */

const moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class TimeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'time',
      memberName: 'time',
      group: 'extra',
      aliases: ['citytime'],
      description: 'Gets the time in any given city',
      format: 'CityName',
      examples: ['time London'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'city',
          prompt: 'Get time in which city?',
          type: 'string'
        }
      ]
    });
  }

  async getCords (city) {
    const cords = await request.get('https://maps.googleapis.com/maps/api/geocode/json?')
      .query('address', city)
      .query('key', process.env.googleapikey);

    if (cords.ok) {
      return [cords.body.results[0].geometry.location.lat, cords.body.results[0].geometry.location.lng];
    }

    return null;
  }

  async run (msg, {city}) {
    startTyping(msg);
    const cords = await this.getCords(city);

    if (cords) {
      const time = await request.get('http://api.timezonedb.com/v2/get-time-zone')
        .query('key', process.env.timezonedbkey)
        .query('format', 'json')
        .query('by', 'position')
        .query('lat', cords[0])
        .query('lng', cords[1]);

      if (time.ok) {
        const timeArr = time.body.formatted.split(' '),
          timeEmbed = new MessageEmbed();

        timeEmbed
          .setTitle(`:flag_${time.body.countryCode.toLowerCase()}: ${city}`)
          .setDescription(stripIndents`**Current Time:** ${timeArr[1]}
					**Current Date:** ${timeArr[0]}
					**Country:** ${time.body.countryName}
					**DST:** ${time.body.dst}`)
          .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00');

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(timeEmbed);
      }
    }
    stopTyping(msg);
    this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
    <@${this.client.owners[0].id}> Error occurred in \`time\` command!
    **Server:** ${msg.guild.name} (${msg.guild.id})
    **Author:** ${msg.author.tag} (${msg.author.id})
    **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
    **Input:** ${city}
    `);

    return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
    Are you sure you spelled the city name correctly?
    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
  }
};