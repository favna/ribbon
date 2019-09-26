import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { NonFunctionKeys } from 'utility-types';

export type CasinoData = Pick<Casino, Exclude<NonFunctionKeys<Casino>, undefined>>;

@Entity()
export default class Casino extends BaseEntity {
  @PrimaryColumn()
  public userId?: string;

  @PrimaryColumn()
  public guildId?: string;

  @Column({ nullable: false, default: 0})
  public balance?: number;

  @Column()
  public lastdaily?: string;

  @Column()
  public lastweekly?: string;

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