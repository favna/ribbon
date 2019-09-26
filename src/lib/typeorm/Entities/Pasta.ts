import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { NonFunctionKeys } from 'utility-types';

export type PastaData = Pick<Pasta, Exclude<NonFunctionKeys<Pasta>, undefined>>;

@Entity()
export default class Pasta extends BaseEntity {
  @PrimaryColumn()
  public name?: string;

  @PrimaryColumn()
  public guildId?: string;

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