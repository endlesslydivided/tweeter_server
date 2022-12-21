import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/user/user.model";
import { Tweet } from "./tweet.model";

@Table({ tableName: "likedTweet",})
export class LikedTweet extends Model<LikedTweet> {

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId: string;

  @ForeignKey(() => Tweet)
  @Column({ type: DataType.UUID })
  tweetId: string;

}