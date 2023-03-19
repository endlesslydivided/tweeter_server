import { BelongsToMany, Column, DataType, Default, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { UserDialog } from "./userDialog.model";
import { User } from "src/user/user.model";
import { Message } from "src/message/message.model";

interface DialogCreationAttribute {
  name: string;
  isGroup: boolean;
  creatorId: string;
}

@Table({ tableName: "dialog"})
export class Dialog extends Model<Dialog, DialogCreationAttribute> {
  
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Unique dialog identifier" })
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, allowNull:false, primaryKey: true })
  id: string;

  @ApiProperty({ example: "Friends and family)", description: "Dialog name" })
  @Column({ type: DataType.STRING, allowNull: true })
  name: string;

  @ApiProperty({ example: "true", description: "Is a group chat?" })
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  isGroup: boolean;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-4266141740001", description: "Id of dialog creator" })
  @Column({ type: DataType.UUID, allowNull: false })
  creatorId: string;

  @BelongsToMany(() => User, () => UserDialog)
  users: User[];

  @HasMany(() => UserDialog)
  userDialog: UserDialog[]

  @HasMany(() => Message, "dialogId")
  messages: Message[];
}
