import RibbonEmbed from '@structures/RibbonEmbed';
import { ApplyOptions, logModMessage } from '@utils/Utils';
import { GuildSettings } from '@settings/GuildSettings';
import { oneLine, stripIndent, stripIndents } from 'common-tags';
import { Command, CommandOptions, KlasaMessage } from 'klasa';

@ApplyOptions<CommandOptions>({
  aliases: [ 'mentionfilter', 'mentionsfilter', 'spammedmentions', 'manymentions', 'emf', 'mfilter' ],
  cooldown: 3,
  cooldownLevel: 'guild',
  description: 'Toggle the excessive mentions filter',
  extendedHelp: stripIndent`
    = Argument Details =
    shouldEnable  ::  Whether the filter should be enabled or not
    threshold     ::  How many mentions that are allowed in 1 message
                      Defaults to 5
  `,
  permissionLevel: 2,
  runIn: [ 'text' ],
  usage: '<shouldEnable:boolean> [threshold:int{1}]',
  usageDelim: ' ',
})
export default class ExcessiveMentionsCommand extends Command {
  async run(msg: KlasaMessage, [ shouldEnable, threshold ]: [boolean, number]) {
    if (shouldEnable) {
      if (!threshold) threshold = 5;
    }

    msg.guildSettings.set(GuildSettings.autmodMentions, { enabled: shouldEnable, threshold });

    const eeEmbed = new RibbonEmbed(msg.author!)
      .setDescription(stripIndents(
        `
        **Action:** Mentions filter has been ${shouldEnable ? 'enabled' : 'disabled'}
        ${shouldEnable ? `**Threshold:** Messages that have at least ${threshold} mentions will be deleted` : ''}
        ${msg.guildSettings.get(GuildSettings.automodEnabled) ? '' : oneLine`
            **Notice:** Be sure to enable the general automod toggle with the \`${msg.guildSettings.get(GuildSettings.prefix)}automod\` command!
          `}
        `
      ));

    logModMessage(msg, eeEmbed);

    return msg.sendEmbed(eeEmbed);
  }
}