import { Argument, util, KlasaGuild, Possible, KlasaMessage } from 'klasa';
import { Role } from 'discord.js';
import { isString } from 'util';

const ROLE_REGEXP = Argument.regex.role;

const resolveRole = (query: Role | string, guild: KlasaGuild) => {
  if (query instanceof Role) return guild.roles.has(query.id) ? query : null;
  if (typeof query === 'string' && ROLE_REGEXP.test(query)) return guild.roles.get(ROLE_REGEXP.exec(query)[1]);

  return null;
};

export default class RolenameArgument extends Argument {
  run(arg: Parameters<typeof resolveRole>[0], possible: Possible, msg: KlasaMessage) {
    if (!msg.guild) throw new Error('This command can only be used inside a server.');
    const resRole = resolveRole(arg, msg.guild);
    if (resRole) return resRole;

    if (isString(arg)) {
      const results = [];
      const reg = new RegExp(util.regExpEsc(arg), 'i');
      for (const role of msg.guild.roles.values()) {
        if (reg.test(role.name)) results.push(role);
      }

      let querySearch: Role[];
      if (results.length > 0) {
        const regWord = new RegExp(`\\b${util.regExpEsc(arg)}\\b`, 'i');
        const filtered = results.filter(role => regWord.test(role.name));
        querySearch = filtered.length > 0 ? filtered : results;
      } else {
        querySearch = results;
      }

      switch (querySearch.length) {
        case 0: throw new Error(`${possible.name} Must be a valid name, id or role mention`);
        case 1: return querySearch[0];
        default:
          if (querySearch[0].name.toLowerCase() === arg.toLowerCase()) return querySearch[0];
          throw new Error(`Found multiple matches: \`${querySearch.map(role => role.name).join('`, `')}\``);
      }
    }

    throw new Error('an invalid argument was given');
  }
}