import FuzzySearch from '@utils/FuzzySearch';
import { GuildMember } from 'discord.js';
import { Argument, KlasaMessage, Possible } from 'klasa';

const USER_REGEXP = Argument.regex.userOrMember;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Argument {
  async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<GuildMember> {
    if (!arg) throw msg.language.get('RESOLVER_INVALID_MEMBERNAME', possible.name);
    if (!msg.guild) throw msg.language.get('NOT_IN_A_GUILD', msg.command!.name);
    const resMember = await this.resolveMember(arg, msg);
    if (resMember) return resMember;

    if (USER_REGEXP.test(arg)) arg = arg.replace(USER_REGEXP, '$1');

    const results = new FuzzySearch(msg.guild.members, [ 'displayName', 'id' ]).run(msg, arg);

    if (results.length >= 1 && results.length < 5) return results[0];
    if (results.length >= 5) throw `Found multiple matches: ${results.map(result => `${result.user.tag}`).join(', ')}. Please be more specific`;
    throw msg.language.get('RESOLVER_INVALID_MEMBERNAME', possible.name);
  }

  public resolveMember(query: string, msg: KlasaMessage) {
    let id: string | null;
    if (USER_REGEXP.test(query)) {
      id = USER_REGEXP.exec(query)![0];
    } else {
      if (USER_TAG.test(query)) {
        id = this.client.usertags.findKey(tag => tag === query) || null;
      }
      id = null;
    }

    if (id) {
      return msg.guild!.members.fetch(id)
        .catch(() => {
          throw msg.language.get('USER_NOT_IN_GUILD');
        });
    }

    return null;
  }

  public get guildmember() {
    return this.store.get('guildmember');
  }
}