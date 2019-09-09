import { Finalizer, KlasaMessage } from 'klasa';
import { GuildSettings } from '@settings/GuildSettings';

export default class DeleteCommandFinalizer extends Finalizer {
  async run(msg: KlasaMessage) {
    if (msg.guild && msg.guildSettings.get(GuildSettings.deleteCommand) && msg.deletable) await msg.delete();
  }
}