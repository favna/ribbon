import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Snowflake } from 'awesome-djs';
import { OptionalKeys } from 'utility-types';

export type CountdownData = Pick<Countdown, OptionalKeys<Countdown>>;

@Entity()
export default class Countdown extends BaseEntity {
  @PrimaryGeneratedColumn()
  public countdownId?: number;

  @Column()
  public guildId?: Snowflake;

  @CreateDateColumn()
  public datetime?: Date;

  @Column()
  public channelId?: Snowflake;

  @Column({ nullable: false, default: '' })
  public content?: string;

  @Column({ nullable: false, default: 'none' })
  public tag?: 'everyone' | 'here' | 'none';

  @CreateDateColumn()
  public lastsend?: Date;

  public constructor(data?: CountdownData) {
    super();

    if (data) {
      this.countdownId = data.countdownId;
      this.guildId = data.guildId;
      this.datetime = data.datetime;
      this.channelId = data.channelId;
      this.content = data.content;
      this.tag = data.tag;
      this.lastsend = data.lastsend;
    }
  }
}