/**
 * @file Weeb TickleCommand - TICKLE WAR 😂!!
 * @module
 * @category weeb
 * @name tickle
 * @example tickle Yang
 * @param {GuildMemberResolvable} [MemberToTickle] Name of the member you want to tickle
 */

import { ASSET_BASE_PATH } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember } from 'awesome-djs';
import fetch from 'node-fetch';
import { NekoData } from 'RibbonTypes';

type TickleArgs = {
  member: GuildMember;
};

export default class TickleCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'tickle',
      group: 'weeb',
      memberName: 'tickle',
      description: 'TICKLE WAR 😂!!',
      format: 'MemberToTickle',
      examples: [ 'tickle Yang' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to tickle?',
          type: 'member',
          default: (msg: CommandoMessage) => msg.member,
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { member }: TickleArgs) {
    try {
      const tickleFetch = await fetch('https://nekos.life/api/v2/img/tickle');
      const tickleImg: NekoData = await tickleFetch.json();
      const isNotSelf = member.id !== msg.member!.id;

      deleteCommandMessages(msg, this.client);

      return msg.embed({
        color: msg.guild ? msg.guild.me!.displayColor : 10610610,
        description: isNotSelf
          ? `${member.displayName}! You were tickled by ${msg.member!.displayName}, tickle them back!!!`
          : `${msg.member!.displayName} you must feel alone... Have a 🐈`,
        image: { url: isNotSelf ? tickleImg.url : `${ASSET_BASE_PATH}/ribbon/digicat.gif` },
      },
      `<@${member ? member.id : msg.author!.id}>`);
    } catch (err) {
      return msg.reply('something went wrong getting a tickle image 💔');
    }
  }
}