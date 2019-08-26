import { Finalizer, KlasaMessage } from 'klasa';

export default class DeleteCommandFinalizer extends Finalizer {
  async run(msg: KlasaMessage) {
    if (msg.guild && msg.guildSettings.get('deleteCommand') && msg.deletable) await msg.delete();
  }
}