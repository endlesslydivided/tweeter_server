import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { User } from "./user.model";

@Table({ tableName: "userCounts", createdAt:false,updatedAt:false,deletedAt:false,})
export class UserCounts extends Model<UserCounts> {

  
  @ForeignKey(() => User)
  @PrimaryKey
  @Column({ type: DataType.UUIDV4 })
  userId: string;

  @Column({ type: DataType.BIGINT})
  subscriptionsCount: number;

  @Column({ type: DataType.BIGINT})
  followersCount: number;

  @Column({ type: DataType.BIGINT})
  tweetsCount: number;

  @BelongsTo(() => User,"userId")
  relatedUser: User

}