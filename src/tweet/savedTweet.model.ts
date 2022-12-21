import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/user/user.model";
import { Tweet } from "./tweet.model";

@Table({ tableName: "savedTweet"})
export class SavedTweet extends Model<SavedTweet> {

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId: string;

  @ForeignKey(() => Tweet)
  @Column({ type: DataType.UUID })
  tweetId: string;

}