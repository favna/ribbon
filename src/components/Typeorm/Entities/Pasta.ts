import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm';
import { Snowflake } from 'discord.js';
import { NonFunctionKeys } from 'utility-types';

export type PastaData = Pick<Pasta, Exclude<NonFunctionKeys<Pasta>, undefined>>;

@Entity()
export default class Pasta extends BaseEntity {
  @PrimaryColumn()
  public name?: string;

  @PrimaryColumn()
  public guildId?: Snowflake;

  @Column({ nullable: false, default: '' })
  public content?: string;

  public constructor(data?: PastaData) {
    super();

    if (data) {
      this.name = data.name;
      this.guildId = data.guildId;
      this.content = data.content;
    }
  }
}