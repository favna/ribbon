/**
 * @file Games ShipCommand - Ship 2 members
 *
 * Leaving 1 or both parameters out will have Ribbon randomly pick 1 or 2 members
 *
 * **Aliases**: `love`, `marry`, `engage`
 * @module
 * @category games
 * @name ship
 * @example ship Biscuit Rei
 * @param {string} [ShipMemberOne] The first member to ship
 * @param {string} [ShipMemberTwo] The second member to ship
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, roundNumber } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildMember, MessageAttachment, MessageEmbed, User } from 'discord.js';
import { oneLine } from 'common-tags';
import jimp from 'jimp';

interface ShipArgs {
  firstMember: GuildMember | string;
  secondMember: GuildMember | string;
}

export default class ShipCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'ship',
      aliases: [ 'love', 'marry', 'engage' ],
      group: 'games',
      memberName: 'ship',
      description: 'Ship 2 members',
      format: 'ShipMemberOne ShipMemberTwo',
      details: 'Leaving 1 or both parameters out will have Ribbon randomly pick 1 or 2 members',
      examples: [ 'ship Biscuit Rei' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'firstMember',
          prompt: 'Who to ship?',
          type: 'member',
          default: 'random',
        },
        {
          key: 'secondMember',
          prompt: 'And who to ship them with?',
          type: 'member',
          default: 'random',
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { firstMember, secondMember }: ShipArgs) {
    const romeo: User = firstMember === 'random' ? msg.guild.members.random()!.user : (firstMember as GuildMember).user;
    const juliet: User = secondMember === 'random' ? msg.guild.members.random()!.user : (secondMember as GuildMember).user;

    const avaOne = await jimp.read(romeo.displayAvatarURL({ format: 'png' }));
    const avaTwo = await jimp.read(juliet.displayAvatarURL({ format: 'png' }));
    const boat = new MessageEmbed();
    const canvas = await jimp.read(384, 128);
    const heart = await jimp.read(`${ASSET_BASE_PATH}/ribbon/heart.png`);
    const randLengthRomeo = roundNumber((Math.random() * 4) + 2);
    const randLengthJuliet = roundNumber((Math.random() * 4) + 2);
    const shipName = (
      romeo.username.substring(0, roundNumber(romeo.username.length / randLengthRomeo)) +
      juliet.username.substring(roundNumber(juliet.username.length / randLengthJuliet))
    ).replace(/[.,\\/#!$%^&*;:{}=\-_`~() ]/g, '');

    avaOne.resize(128, jimp.AUTO);
    avaTwo.resize(128, jimp.AUTO);

    canvas.blit(avaOne, 0, 0);
    canvas.blit(avaTwo, 256, 0);
    canvas.blit(heart, 160, 32);

    const buffer = await canvas.getBufferAsync(jimp.MIME_PNG);
    const embedAttachment = new MessageAttachment(buffer, 'ship.png');

    boat.attachFiles([ embedAttachment ])
      .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
      .setTitle(`Shipping ${romeo.username} and ${juliet.username}`)
      .setDescription(oneLine`I call it... ${shipName}! 😘`)
      .setImage('attachment://ship.png');

    deleteCommandMessages(msg, this.client);

    return msg.embed(boat);
  }
}