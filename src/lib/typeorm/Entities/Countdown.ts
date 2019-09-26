import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { NonFunctionKeys } from 'utility-types';

export type CountdownData = Pick<Countdown, Exclude<NonFunctionKeys<Countdown>, undefined>>;

@Entity()
export default class Countdown extends BaseEntity {
  @PrimaryColumn()
  public name?: string;

  @PrimaryColumn()
  public guildId?: string;

  @Column()
  public datetime?: string;

  @Column()
  public channelId?: string;

  @Column({ nullable: false, default: '' })
  public content?: string;

  @Column({ nullable: false, default: 'none' })
  public tag?: 'everyone' | 'here' | 'none';

  @Column()
  public lastsend?: string;

  public constructor(data?: CountdownData) {
    super();

    if (data) {
      this.name = data.name;
      this.guildId = data.guildId;
      this.datetime = data.datetime;
      this.channelId = data.channelId;
      this.content = data.content;
      this.tag = data.tag;
      this.lastsend = data.lastsend;
    }
  }
}