import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm';
import { Snowflake } from 'awesome-djs';
import { NonFunctionKeys } from 'utility-types';

export type PastaData = Pick<Pasta, Exclude<NonFunctionKeys<Pasta>, undefined>>;

@Entity()
export default class Pasta extends BaseEntity {
  @PrimaryColumn()
  public name?: string;

  @Column()
  public guildId?: Snowflake;

  @Column({ nullable: false, default: '' })
  public content?: string;

  public constructor(data?: PastaData) {
    super();

    if (data) {
      this.guildId = data.guildId;
      this.name = data.name;
      this.content = data.content;
    }
  }
}