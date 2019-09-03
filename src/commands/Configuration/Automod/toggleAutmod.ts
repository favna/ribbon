import RibbonEmbed from '@root/components/RibbonEmbed';
import { ApplyOptions, logModMessage } from '@root/components/Utils';
import { GuildSettings } from '@root/RibbonTypes';
import { stripIndent, stripIndents } from 'common-tags';
import { Command, CommandOptions, KlasaMessage } from 'klasa';

@ApplyOptions<CommandOptions>({
  aliases: [ 'ta', 'togmod' ],
  cooldown: 3,
  cooldownLevel: 'guild',
  description: 'Toggles the entire automod suite of features',
  extendedHelp: stripIndent`
    = Argument Details =
    shouldEnable :: Whether the automod suite of features should be enabled or not
  `,
  permissionLevel: 2,
  runIn: [ 'text' ],
  usage: '<shouldEnable:bool>',
})
export default class ToggleAutmodCommand extends Command {
  async run(msg: KlasaMessage, [ shouldEnable ]: [boolean]) {
    msg.guildSettings.set(GuildSettings.automodEnabled, shouldEnable);
    const automodEmbed = new RibbonEmbed(msg.author!)
      .setDescription(stripIndents(
        `
          **Action:** Automod features have been ${shouldEnable ? 'enabled' : 'disabled'}
        `
      ));

    logModMessage(msg, automodEmbed);

    return msg.sendEmbed(automodEmbed);
  }
}