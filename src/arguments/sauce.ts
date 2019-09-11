import { Argument, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
  run(arg: string, possible: Possible, msg: KlasaMessage) {
    if (this.hasMessageAttachment(msg)) return msg.attachments.first()!.url;
    if (this.isValidImageURL(arg)) return arg;

    throw 'B-baka! I need an image to find a source for!';
  }

  private hasMessageAttachment(msg: KlasaMessage) {
    return msg.attachments.first() && msg.attachments.first()!.url;
  }

  private isValidImageURL(arg: string) {
    const pattern = new RegExp('(https?://.*.(?:png|jpg|jpeg|gif|webp))', 'gi');

    return pattern.test(arg.toLowerCase());
  }
}