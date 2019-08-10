import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { Snowflake } from 'awesome-djs';
import { NonFunctionKeys } from 'utility-types';

export type PastaData = Pick<Pasta, Exclude<NonFunctionKeys<Pasta>, undefined>>;

@Entity()
export default class Pasta extends BaseEntity {
  @PrimaryGeneratedColumn()
  public pastaId?: number;

  @Column()
  public guildId?: Snowflake;

  @Column()
  public name?: string;

  @Column({ nullable: false, default: '' })
  public content?: string;

  public constructor(data?: PastaData) {
    super();

    if (data) {
      this.pastaId = data.pastaId;
      this.guildId = data.guildId;
      this.name = data.name;
      this.content = data.content;
    }
  }
}