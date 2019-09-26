import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { NonFunctionKeys } from 'utility-types';

export type WarningData = Pick<Warning, Exclude<NonFunctionKeys<Warning>, undefined>>;

@Entity()
export default class Warning extends BaseEntity {
  @PrimaryColumn()
  public userId?: string;

  @PrimaryColumn()
  public guildId?: string;

  @Column()
  public tag?: string;

  @Column({ nullable: false, default: 0 })
  public points?: number;

  public constructor(data?: WarningData) {
    super();

    if (data) {
      this.userId = data.userId;
      this.guildId = data.guildId;
      this.tag = data.tag;
      this.points = data.points;
    }
  }
}