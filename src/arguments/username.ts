import FuzzySearch from '@utils/FuzzySearch';
import { Argument, KlasaMessage, KlasaUser, Possible } from 'klasa';

const USER_REGEXP = Argument.regex.userOrMember;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Argument {
  async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<KlasaUser> {
    if (!arg) throw msg.language.get('RESOLVER_INVALID_USERNAME', possible.name);
    if (!msg.guild) return this.user.run(arg, possible, msg);
    const resUser = await this.resolveUser(arg, msg);
    if (resUser) return resUser;

    if (USER_REGEXP.test(arg)) arg = arg.replace(USER_REGEXP, '$1');

    const users = await msg.guild.fetchMemberUsers();
    const results = new FuzzySearch(users, [ 'username', 'id', 'tag' ]).run(msg, arg);

    if (results.length >= 1 && results.length < 5) return results[0];
    if (results.length >= 5) throw `Found multiple matches: ${results.map(result => `${result.tag}`).join(', ')}. Please be more specific`;
    throw msg.language.get('RESOLVER_INVALID_USERNAME', possible.name);
  }

  public async resolveUser(query: string, msg: KlasaMessage) {
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
      return this.client.users.fetch(id)
        .catch(() => {
          throw msg.language.get('USER_NOT_EXISTENT');
        });
    }

    return null;
  }

  public get user() {
    return this.store.get('user');
  }
}