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

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {stripIndents} = require('common-tags'),
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
          key: 'location',
          prompt: 'For which location do you want to know the current time?',
          type: 'string'
        }
      ]
    });
  }

  async getCords (location) {
    const cords = await request.get('https://maps.googleapis.com/maps/api/geocode/json?')
      .query('address', location)
      .query('key', process.env.googleapikey);

    return {
      lat: cords.body.results[0].geometry.location.lat,
      long: cords.body.results[0].geometry.location.lng,
      address: cords.body.results[0].formatted_address
    };
  }

  async run (msg, {location}) {
    try {
      startTyping(msg);
      const cords = await this.getCords(location),
        time = await request.get('http://api.timezonedb.com/v2/get-time-zone')
          .query('key', process.env.timezonedbkey)
          .query('format', 'json')
          .query('by', 'position')
          .query('lat', cords.lat)
          .query('lng', cords.long),
        timeArr = time.body.formatted.split(' '),
        timeEmbed = new MessageEmbed();

      timeEmbed
        .setTitle(`:flag_${time.body.countryCode.toLowerCase()}: ${cords.address}`)
        .setDescription(stripIndents`**Current Time:** ${timeArr[1]}
					**Current Date:** ${timeArr[0]}
					**Country:** ${time.body.countryName}
					**DST:** ${time.body.dst}`)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(timeEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`i wasn't able to find a location for \`${location}\``);
    }
  }
};