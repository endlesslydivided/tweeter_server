import { ApiProperty } from "@nestjs/swagger";
import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/user/user.model";
import { Message } from "./message.model";

@Table({ tableName: "favoriteMessage"})
export class FavoriteMessage extends Model<FavoriteMessage> {

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "User which marked a message" })
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001", description: "Favorite message id" })
  @ForeignKey(() => Message)
  @Column({ type: DataType.UUID })
  messageId: string;

  @BelongsTo(() => User,"userId")
  user: User

  @BelongsTo(() => Message,"messageId")
  message: Message

}