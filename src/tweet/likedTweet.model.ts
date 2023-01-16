import { ApiProperty } from "@nestjs/swagger";
import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/user/user.model";
import { Tweet } from "./tweet.model";

@Table({ tableName: "likedTweet",})
export class LikedTweet extends Model<LikedTweet> {

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "User which liked a tweet" })
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001", description: "Liked tweet id" })
  @ForeignKey(() => Tweet)
  @Column({ type: DataType.UUID })
  tweetId: string;

  @BelongsTo(() => User,"userId")
  user: User

  @BelongsTo(() => Tweet,"tweetId")
  tweet: Tweet

}