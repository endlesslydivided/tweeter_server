import { BelongsTo, Column, DataType, Default, ForeignKey, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Dialog } from "src/dialog/dialog.model";
import { User } from "src/user/user.model";
import { Media } from "src/media/media.model";
import { Tweet } from "src/tweet/tweet.model";
import { FavoriteMessage } from "./favoriteMessage.model";


interface MessageCreationAttribute {
  dialogId: string;
  userId: string;
  text: string;
}

@Table({ tableName: "messages", })
export class Message extends Model<Message, MessageCreationAttribute> {

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001", description: "Unique message identifier" })
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, allowNull:false, primaryKey: true })
  id: string;

  @ApiProperty({ example: "Hi!", description: "Message text" })
  @Column({ type: DataType.TEXT, allowNull: true })
  text: string;

  @ApiProperty({ example: "0", description: "ID of message dialog" })
  @ForeignKey(() => Dialog)
  @Column({ type: DataType.UUID, allowNull: true })
  dialogId: string;

  @ApiProperty({ example: "0", description: "ID of message user" })
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  userId: string;

  @ApiProperty({ example: "0", description: "ID of message tweet" })
  @ForeignKey(() => Tweet)
  @Column({ type: DataType.UUID, allowNull: true })
  messageTweetId: string;
  
  @BelongsTo(() => User)
  user: User;

  @HasOne(() => FavoriteMessage,{as:'isFavorite'})
  userFavoriteMessage: FavoriteMessage

  //Message's media
  @HasMany(() => Media,"messageRecordId")
  messageMedia: Media[]

  //Retweeted tweet
  @BelongsTo(() => Tweet,"messageTweetId")
  messageTweet: Tweet
}