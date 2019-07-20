/**
 * @file Weeb PokeCommand - Poke an annoying person 👉!
 * @module
 * @category weeb
 * @name poke
 * @example poke Weiss
 * @param {GuildMemberResolvable} [MemberToPoke] Name of the member you want to poke
 */

import { ASSET_BASE_PATH } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember } from 'awesome-djs';
import fetch from 'node-fetch';
import { NekoData } from 'RibbonTypes';

type PokeArgs = {
  member: GuildMember;
};

export default class PokeCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'poke',
      group: 'weeb',
      memberName: 'poke',
      description: 'Poke an annoying person 👉!',
      format: 'MemberToPoke',
      examples: [ 'poke Weiss' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to poke?',
          type: 'member',
          default: (msg: CommandoMessage) => msg.member,
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { member }: PokeArgs) {
    try {
      const pokeFetch = await fetch('https://nekos.life/api/v2/img/poke');
      const pokeImg: NekoData = await pokeFetch.json();
      const isNotSelf = member.id !== msg.member.id;

      deleteCommandMessages(msg, this.client);

      return msg.embed({
        color: msg.guild ? msg.guild.me.displayColor : 10610610,
        description: isNotSelf
          ? `${member.displayName}! You got poked by ${msg.member.displayName} 👉!`
          : `${msg.member.displayName} you must feel alone... Have a 🐈`,
        image: { url: isNotSelf ? pokeImg.url : `${ASSET_BASE_PATH}/ribbon/digicat.gif` },
      },
      `<@${member ? member.id : msg.author.id}>`);
    } catch (err) {
      return msg.reply('something went wrong getting a poke image 💔');
    }
  }
}