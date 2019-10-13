import FuzzySearch from '@utils/FuzzySearch';
import { GuildChannel } from 'discord.js';
import { Argument, KlasaGuild, KlasaMessage, Possible } from 'klasa';

const CHANNEL_REGEXP = Argument.regex.channel;

export default class extends Argument {
  run(arg: string, possible: Possible, msg: KlasaMessage): GuildChannel {
    if (!arg) throw msg.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
    if (!msg.guild) return this.channel.run(arg, possible, msg);
    const resChannel = this.resolveChannel(arg, msg.guild);
    if (resChannel) return resChannel;

    if (CHANNEL_REGEXP.test(arg)) arg = arg.replace(CHANNEL_REGEXP, '$1');
    const textChannels = msg.guild.channels.filter(channel => channel.type === 'text');

    const results = new FuzzySearch(textChannels, [ 'name', 'id' ]).run(arg);

    if (results.length >= 1 && results.length < 5) return results[0];
    if (results.length >= 5) throw `Found multiple matches: ${results.map(result => `<@${result.name}>`).join(', ')}. Please be more specific`;
    throw msg.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
  }

  public resolveChannel(query: string, guild: KlasaGuild) {
    if (CHANNEL_REGEXP.test(query)) return guild.channels.get(CHANNEL_REGEXP.exec(query)![1]);

    return null;
  }

  public get channel() {
    return this.store.get('channel');
  }
}