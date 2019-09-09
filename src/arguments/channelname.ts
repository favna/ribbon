import { GuildChannel } from 'discord.js';
import { Argument, KlasaGuild, KlasaMessage, Possible } from 'klasa';
import FuzzySearch from '@utils/FuzzySearch';

const CHANNEL_REGEXP = Argument.regex.channel;

export default class ChannelnameArgument extends Argument {
  run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: GuildChannel) => boolean): GuildChannel {
    if (!arg) throw message.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
    if (!message.guild) return this.channel.run(arg, possible, message);
    const resChannel = this.resolveChannel(arg, message.guild);
    if (resChannel) return resChannel;

    const result = new FuzzySearch(message.guild!.channels, [ 'name', 'id' ]).run(message, arg);
    if (result && result.length) return result[0];
    throw message.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
  }

  public resolveChannel(query: string, guild: KlasaGuild) {
    if (CHANNEL_REGEXP.test(query)) return guild!.channels.get(CHANNEL_REGEXP.exec(query)![1]);

    return null;
  }

  public get channel() {
    return this.store.get('channel');
  }
}