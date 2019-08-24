import { GuildMember } from 'discord.js';
import { Argument, KlasaGuild, KlasaMessage, KlasaUser, Possible, util } from 'klasa';
import { isString } from 'util';

const USER_REGEXP = Argument.regex.userOrMember;

const resolveMember = async (query: GuildMember | KlasaUser | string, guild: KlasaGuild) => {
  if (query instanceof GuildMember) return query;
  if (query instanceof KlasaUser) return guild.members.fetch(query.id);
  if (typeof query === 'string') {
    if (USER_REGEXP.test(query)) return guild.members.fetch((USER_REGEXP.exec(query) as RegExpExecArray)[1]);
    if (/\w{1,32}#\d{4}/.test(query)) {
      const res = guild.members.find(member => member.user.tag.toLowerCase() === query.toLowerCase());

      return res || null;
    }
  }

  return null;
};

export default class MembernameArgument extends Argument {
  async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<GuildMember> {
    if (!msg.guild) throw new Error('This command can only be used inside a server.');
    try {
      const resUser = await resolveMember(arg, msg.guild);
      if (resUser) return resUser;
    } catch {
      // Proceed normally
    }

    if (isString(arg)) {
      const results = [];
      const reg = new RegExp(util.regExpEsc(arg), 'i');
      for (const member of msg.guild.members.values()) {
        if (reg.test(member.user.username)) results.push(member);
      }

      let querySearch: GuildMember[];
      if (results.length > 0) {
        const regWord = new RegExp(`\\b${util.regExpEsc(arg)}\\b`, 'i');
        const filtered = results.filter(member => regWord.test(member.user.username));
        querySearch = filtered.length > 0 ? filtered : results;
      } else {
        querySearch = results;
      }

      switch (querySearch.length) {
        case 0: throw new Error(`${possible.name} Must be a valid name, id or user mention`);
        case 1: return querySearch[0];
        default: throw new Error(`Found multiple matches: \`${querySearch.map(member => member.user.tag).join('`, `')}\``);
      }
    }

    throw new Error('an invalid argument was given');
  }
}