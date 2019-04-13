import { ArgumentType, CommandoClient, CommandoMessage } from 'awesome-commando';

export default class SaucableType extends ArgumentType {
    constructor (client: CommandoClient) {
        super(client, 'saucable');
    }

    public validate (value: string, message: CommandoMessage) {
        if (this.hasAttachment(message)) return true;
        if (this.isValidImageURL(value)) return true;
        return 'Please supply an image URL or a image attachment for me to find the source for';
    }

    public parse (value: string, message: CommandoMessage) {
        if (this.hasAttachment(message)) return message.attachments.first()!.url;
        return value;
    }

    private hasAttachment (message: CommandoMessage) {
        return message.attachments.first() && message.attachments.first()!.url;
    }

    private isValidImageURL (url: string) {
        const pattern = new RegExp('(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))', 'gi');
        return pattern.test(url);
    }
}