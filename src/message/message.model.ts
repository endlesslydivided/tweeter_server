import { BelongsTo, Column, DataType, Default, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Dialog } from "src/dialog/dialog.model";
import { User } from "src/user/user.model";
import { Media } from "src/media/media.model";


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
  @Column({ type: DataType.TEXT, allowNull: false })
  text: string;

  @ApiProperty({ example: "0", description: "ID of message dialog" })
  @ForeignKey(() => Dialog)
  @Column({ type: DataType.UUID, allowNull: true })
  dialogId: string;

  @ApiProperty({ example: "0", description: "ID of message user" })
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  //Message's media
  @HasMany(() => Media,"messageRecordId")
  messageMedia: Media[]
}