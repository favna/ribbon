import { enumerable } from '../utils/Utils';
import { Collection, Structures } from 'discord.js';
import { KlasaUser } from 'klasa';

export class RibbonGuild extends Structures.get('Guild') {
  @enumerable(false)
  public memberSnowflakes: Set<string> = new Set();

  public get memberTags() {
    const collection = new Collection<string, string>();
    for (const snowflake of this.memberSnowflakes) {
      const username = this.client!.usertags.get(snowflake);
      if (username) collection.set(snowflake, username);
    }

    return collection;
  }

  public get memberUsernames() {
    const collection = new Collection<string, string>();
    for (const snowflake of this.memberSnowflakes) {
      const username = this.client.usertags.get(snowflake);
      if (username) collection.set(snowflake, username.slice(0, username.indexOf('#')));
    }

    return collection;
  }

  public async fetchMemberUsers() {
    const collection = new Collection<string, KlasaUser>();
    for (const snowflake of this.memberSnowflakes) {
      const user = await this.client.fetchUser(snowflake);
      if (user) collection.set(snowflake, user);
    }

    return collection;
  }
}


declare module 'discord.js' {
  export interface Guild {
    memberSnowflakes: Set<string>;
    memberTags: Collection<string, string>;
    memberUsernames: Collection<string, string>;
    fetchMemberUsers(): Promise<Collection<string, KlasaUser>>;
  }
}

Structures.extend('Guild', () => RibbonGuild);