import { GuildSettings } from '@settings/GuildSettings';
import RibbonEmbed from '@extensions/RibbonEmbed';
import { ApplyOptions, logModMessage } from '@utils/Utils';
import { oneLine, stripIndent, stripIndents } from 'common-tags';
import { Command, CommandOptions, KlasaMessage } from 'klasa';

@ApplyOptions<CommandOptions>({
  aliases: [ 'elf', 'extlinks', 'extlinksfilter' ],
  cooldown: 3,
  cooldownLevel: 'guild',
  description: 'Toggles the external links filter',
  extendedHelp: stripIndent`
    = Argument Details =
    shouldEnable :: Whether the filter should be enabled or not
  `,
  permissionLevel: 2,
  runIn: [ 'text' ],
  usage: '<shouldEnable:bool>',
})
export default class extends Command {
  async run(msg: KlasaMessage, [ shouldEnable ]: [boolean]) {
    msg.guildSettings.set(GuildSettings.automodLinks, shouldEnable);

    const elfEmbed = new RibbonEmbed(msg.author)
      .setDescription(stripIndents(
        `
          **Action:** External Links filter has been ${shouldEnable ? 'enabled' : 'disabled'}
          ${msg.guildSettings.get(GuildSettings.automodEnabled) ? '' : oneLine`
              **Notice:** Be sure to enable the general automod toggle with the \`${msg.guildSettings.get(GuildSettings.prefix)}automod\` command!
            `}
        `
      ));

    logModMessage(msg, elfEmbed);

    return msg.sendEmbed(elfEmbed);
  }
}