import { GuildChannel } from 'discord.js';
import { Argument, KlasaGuild, KlasaMessage, Possible, util } from 'klasa';
import { isString } from 'util';

const CHANNEL_REGEXP = Argument.regex.channel;

const resolveChannel = (query: GuildChannel | KlasaMessage | string, guild: KlasaGuild): GuildChannel | null | undefined => {
  if (query instanceof GuildChannel) return guild.channels.has(query.id) ? query : null;
  if (query instanceof KlasaMessage) return query.guild!.id === guild.id ? (query.channel as GuildChannel) : null;
  if (typeof query === 'string' && CHANNEL_REGEXP.test(query)) return guild.channels.get((CHANNEL_REGEXP.exec(query) as RegExpExecArray)[1]);

  return null;
};

export default class ChannelnameArgument extends Argument {
  run(arg: string, possible: Possible, msg: KlasaMessage): GuildChannel {
    if (!msg.guild) throw new Error('This command can only be used inside a server.');
    const resChannel = resolveChannel(arg, msg.guild);
    if (resChannel) return resChannel;

    if (isString(arg)) {
      const results = [];
      const reg = new RegExp(util.regExpEsc(arg), 'i');
      for (const channel of msg.guild.channels.values()) {
        if (reg.test(channel.name)) results.push(channel);
      }

      let querySearch: GuildChannel[];
      if (results.length > 0) {
        const regWord = new RegExp(`\\b${util.regExpEsc(arg)}\\b`, 'i');
        const filtered = results.filter(channel => regWord.test(channel.name));
        querySearch = filtered.length > 0 ? filtered : results;
      } else {
        querySearch = results;
      }

      switch (querySearch.length) {
        case 0: throw new Error(`${possible.name} Must be a valid name, id or channel mention`);
        case 1: return querySearch[0];
        default: throw new Error(`Found multiple matches: \`${querySearch.map(channel => channel.name).join('`, `')}\``);
      }
    }
    throw new Error('an invalid argument was given');
  }
}