import { ArgumentType, CommandoClient, CommandoMessage } from 'awesome-commando';

export default class SaucableType extends ArgumentType {
  constructor (client: CommandoClient) {
    super(client, 'saucable');
  }

  public validate (value: string, message: CommandoMessage): boolean | string {
    if (this.hasMessageAttachment(message)) return true;
    if (this.isValidImageURL(value)) return true;

    return 'B-baka! I need an image to find a source for!';
  }

  public parse (value: string, message: CommandoMessage): string {
    if (this.hasMessageAttachment(message)) return message.attachments.first()!.url;
    return value;
  }

  public isEmpty (value: string, message: CommandoMessage): boolean {
    if (this.hasMessageAttachment(message)) return false;
    if (this.isValidImageURL(value)) return false;
    return true;
  }

  private hasMessageAttachment (message: CommandoMessage) {
    return message.attachments.first() && message.attachments.first()!.url;
  }

  private isValidImageURL (url: string) {
    const pattern = new RegExp('(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))', 'gi');
    return pattern.test(url.toLowerCase());
  }
}