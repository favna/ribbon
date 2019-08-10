import { Entity, Column, BaseEntity, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { Snowflake } from 'awesome-djs';
import { OptionalKeys } from 'utility-types';

export type CasinoData = Pick<Casino, OptionalKeys<Casino>>;

@Entity()
export default class Casino extends BaseEntity {
  @PrimaryColumn()
  public userId?: Snowflake;

  @PrimaryColumn()
  public guildId?: Snowflake;

  @Column({ nullable: false, default: 0})
  public balance?: number;

  @CreateDateColumn()
  public lastdaily?: Date;

  @CreateDateColumn()
  public lastweekly?: Date;

  @Column({nullable: false, default: 0})
  public vault?: number;

  public constructor(data?: CasinoData) {
    super();

    if (data) {
      this.userId = data.userId;
      this.guildId = data.guildId;
      this.balance = data.balance;
      this.lastdaily = data.lastdaily;
      this.lastweekly = data.lastweekly;
      this.vault = data.vault;
    }
  }
}