import FuzzySearch from '@utils/FuzzySearch';
import { Role } from 'discord.js';
import { Argument, KlasaGuild, KlasaMessage, Possible } from 'klasa';

const ROLE_REGEXP = Argument.regex.role;

export default class extends Argument {
  run(arg: string, possible: Possible, msg: KlasaMessage): Role {
    if (!arg) throw msg.language.get('RESOLVE_INVALID_ROLE', possible.name);
    if (!msg.guild) return this.role.run(arg, possible, msg);
    const resRole = this.resolveRole(arg, msg.guild);
    if (resRole) return resRole;

    if (ROLE_REGEXP.test(arg)) arg = arg.replace(ROLE_REGEXP, '$1');

    const results = new FuzzySearch(msg.guild.roles, [ 'name', 'id' ]).run(msg, arg);

    if (results.length >= 1 && results.length < 5) return results[0];
    if (results.length >= 5) throw `Found multiple matches: ${results.map(result => `<@${result.name}>`).join(', ')}. Please be more specific`;
    throw msg.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
  }

  public get role() {
    return this.store.get('role');
  }

  public resolveRole(query: string, guild: KlasaGuild) {
    if (ROLE_REGEXP.test(query)) return guild.roles.get(ROLE_REGEXP.exec(query)![1]);

    return null;
  }
}