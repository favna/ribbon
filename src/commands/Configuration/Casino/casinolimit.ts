import { Command, KlasaMessage, CommandOptions } from 'klasa';
import { ApplyOptions, logModMessage } from '@components/Utils';
import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { GuildSettings } from '@root/RibbonTypes';

@ApplyOptions<CommandOptions>({
  aliases: [ 'cl' ],
  cooldown: 5,
  description: 'Configure what the limits for any casino command should be.',
  permissionLevel: 6,
  runIn: [ 'text' ],
  usage: '<upperLimit:integer{10}> <lowerLimit:integer{10}>',
})
export default class CasinoLimitCommand extends Command {
  async run(msg: KlasaMessage, [ lowerLimit, upperLimit ]: [number, number]) {
    msg.guildSettings.set(GuildSettings.casinoLowerLimit, lowerLimit);
    msg.guildSettings.set(GuildSettings.casinoUpperLimit, upperLimit);
    const casinoLimitEmbed = new MessageEmbed()
      .setColor('#3DFFE5')
      .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
      .setDescription(stripIndents(
        `
          **Action:** Changed casino limits
          **Lower Limit:** \`${lowerLimit}\`
          **Upper Limit:** \`${upperLimit}\`
        `
      ))
      .setTimestamp();

    logModMessage(msg, casinoLimitEmbed);

    return msg.sendEmbed(casinoLimitEmbed);
  }
}