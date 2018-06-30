/**
 * @file Extra Weather - Get the current weather forecast in any city  
 * Potentially you'll have to specify city if the city is in multiple countries, i.e. `weather amsterdam` will not be the same as `weather amsterdam missouri`  
 * Uses Google's Geocoding to determine the correct location therefore supports any location indication, country, city or even as exact as a street.  
 * **Aliases**: `temp`, `forecast`, `fc`, `wth`
 * @module
 * @category extra
 * @name weather
 * @example weather Amsterdam
 * @param {StringResolvable} CityName Name of the city to get the weather forecast for
 * @returns {MessageEmbed} Various statistics about the current forecast
 */

const moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, roundNumber, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class WeatherCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'weather',
      memberName: 'weather',
      group: 'extra',
      aliases: ['temp', 'forecast', 'fc', 'wth'],
      description: 'Get the weather in a city',
      details: stripIndents`
      Potentially you'll have to specify city if the city is in multiple countries, i.e. \`weather amsterdam\` will not be the same as \`weather amsterdam missouri\`
      Uses Google's Geocoding to determine the correct location therefore supports any location indication, country, city or even as exact as a street.`,
      format: 'CityName',
      examples: ['weather amsterdam'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'location',
          prompt: 'For which location do you want to know the weather forecast?',
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

  fahrenify (temp) {
    return temp * 1.8 + 32;
  }

  async run (msg, {location}) {
    try {
      startTyping(msg);
      const cords = await this.getCords(location),
        wethData = await request
          .get(`https://api.darksky.net/forecast/${process.env.darkskykey}/${cords.lat},${cords.long}`)
          .query('exclude', ['minutely', 'hourly', 'alerts', 'flags'])
          .query('units', 'si'),
        wethEmbed = new MessageEmbed();

      wethEmbed
        .setTitle(`Weather forecast for ${cords.address}`)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setFooter('Powered by DarkSky')
        .setTimestamp()
        .setThumbnail(`https://favna.xyz/images/ribbonhost/weather/${wethData.body.currently.icon}.png`)
        .setDescription(wethData.body.daily.summary)
        .addField('💨 Wind Speed', `${wethData.body.currently.windSpeed} km/h`, true)
        .addField('💧 Humidity', `${wethData.body.currently.humidity * 100}%`, true)
        .addField('🌅 Sunrise', moment(wethData.body.daily.data[0].sunriseTime * 1000).format('HH:mm'), true)
        .addField('🌇 Sunset', moment(wethData.body.daily.data[0].sunsetTime * 1000).format('HH:mm'), true)
        .addField('☀️ Today\'s High', `${wethData.body.daily.data[0].temperatureHigh} °C | ${roundNumber(this.fahrenify(wethData.body.daily.data[0].temperatureHigh), 2)} °F`, true)
        .addField('☁️️ Today\'s Low', `${wethData.body.daily.data[0].temperatureLow} °C | ${roundNumber(this.fahrenify(wethData.body.daily.data[0].temperatureLow), 2)} °F`, true)
        .addField('🌡️ Temperature', `${wethData.body.currently.temperature} °C | ${roundNumber(this.fahrenify(wethData.body.currently.temperature), 2)} °F`, true)
        .addField('🌡️ Feels Like', `${wethData.body.currently.apparentTemperature} °C | ${roundNumber(this.fahrenify(wethData.body.currently.apparentTemperature), 2)} °F`, true)
        .addField('🏙️ Condition', wethData.body.daily.data[0].summary, false)
        .addField(`🛰️ Forecast ${moment.unix(wethData.body.daily.data[1].time).format('dddd MMMM Do')}`,
          oneLine`High: ${wethData.body.daily.data[1].temperatureHigh} °C (${roundNumber(this.fahrenify(wethData.body.daily.data[1].temperatureHigh), 2)} °F) 
          | Low: ${wethData.body.daily.data[1].temperatureLow} °C (${roundNumber(this.fahrenify(wethData.body.daily.data[1].temperatureLow), 2)} °F)`, false)
        .addField(`🛰️ Forecast ${moment.unix(wethData.body.daily.data[2].time).format('dddd MMMM Do')}`,
          oneLine`High: ${wethData.body.daily.data[2].temperatureHigh} °C (${roundNumber(this.fahrenify(wethData.body.daily.data[2].temperatureHigh), 2)} °F) 
          | Low: ${wethData.body.daily.data[2].temperatureLow} °C (${roundNumber(this.fahrenify(wethData.body.daily.data[2].temperatureLow), 2)} °F)`, false);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(wethEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`i wasn't able to find a location for \`${location}\``);
    }
  }
};