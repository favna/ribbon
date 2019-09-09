import { ApplyOptions, logModMessage } from '@utils/Utils';
import RibbonEmbed from '@structures/RibbonEmbed';
import { GuildSettings } from '@settings/GuildSettings';
import { stripIndents } from 'common-tags';
import { Command, CommandOptions, KlasaMessage } from 'klasa';

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
    const casinoLimitEmbed = new RibbonEmbed(msg.author!)
      .setDescription(stripIndents(
        `
          **Action:** Changed casino limits
          **Lower Limit:** \`${lowerLimit}\`
          **Upper Limit:** \`${upperLimit}\`
        `
      ));

    logModMessage(msg, casinoLimitEmbed);

    return msg.sendEmbed(casinoLimitEmbed);
  }
}