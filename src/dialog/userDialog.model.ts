import { ApiProperty } from "@nestjs/swagger";
import { BelongsTo, BelongsToMany, Column, DataType, Default, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/user/user.model";
import { Dialog } from "./dialog.model";

@Table({ tableName: "userDialog", timestamps: true, createdAt: "createdAt", updatedAt: false })
export class UserDialog extends Model<UserDialog> {

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Unique user dialog identifier" })
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, allowNull:false, primaryKey: true })
  id: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001", description: "User identifier" })
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING })
  userId: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Dialog identifier" })
  @ForeignKey(() => Dialog)
  @Column({ type: DataType.STRING })
  dialogId: string;

  @BelongsTo(() => User)
  user: User

  @BelongsTo(() => Dialog)
  dialog: Dialog
}