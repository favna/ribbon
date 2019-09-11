import { ApplyOptions } from '@utils/Utils';
import { stripIndent } from 'common-tags';
import { Command, CommandOptions, KlasaMessage, Possible } from 'klasa';

@ApplyOptions<CommandOptions>({
  aliases: [ 'countdown' ],
  cooldown: 3,
  cooldownLevel: 'guild',
  description: 'Configures the countdowns for this server',
  extendedHelp: stripIndent`
    = Argument Details =
    add | list | remove :: The subcommand to trigger

    = add options =
    name          :: The name for the countdown
    datetime      :: The date to which the countdown should run
    channel       :: The channel in which the countdown should be repeated on a daily basis
    content       :: The content to send in the countdown
    = add flags =
    --everyone    :: Tag @everyone when the countdown date is reached
    --here        :: Tag @here when the countdown date is reached

    = remove options =
    name          :: The name of the countdown to remove
  `,
  permissionLevel: 2,
  runIn: [ 'text' ],
  usage: '<add|list|remove> (name:str) (date:time) (channel:textchannel) (content:str)',
  usageDelim: ' ',
  subcommands: true,
  flagSupport: true,
})
export default class extends Command {
  async init() {
    this
      .createCustomResolver('name', (arg: string, possible: Possible, msg: KlasaMessage, [ action ]: unknown[]) => {
        if (action === 'add' || action === 'remove') return null;
        throw msg.language.get('COMMAND_CONF_NOKEY');
      });
  }

  run(msg: KlasaMessage, ...args: unknown[]) {
    return msg.send('blub');
  }
}