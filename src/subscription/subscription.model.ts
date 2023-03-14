import { BelongsTo, Column, CreatedAt, DataType, Default, ForeignKey, HasMany, HasOne, Model, Table, UpdatedAt } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/user/user.model";

interface SubscriptionCreationAttribute {
  friendId: number;
  userId: number;
  isRejected: boolean;
}

@Table({ tableName: "subscription"})
export class Subscription extends Model<Subscription, SubscriptionCreationAttribute> 
{
    //Data fields
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Unique subscription identifier" })
    @Default(DataType.UUIDV4)
    @Column({ type: DataType.UUID, allowNull:false, primaryKey: true })
    id: string;

    @ApiProperty({ example: "0", description: "ID of user" })
    @ForeignKey(() => User)
    @Column({ type: DataType.UUID })
    subscriberId: string;

    @ApiProperty({ example: "0", description: "ID of user to be subscribed" })
    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: true })
    subscribedUserId: string;

    @ApiProperty({ example: "0", description: "Did a user reject a request?" })
    @Default(null)
    @Column({ type: DataType.BOOLEAN, allowNull:true})
    isRejected: boolean;

    @BelongsTo(() => User,{as:"subscriber",foreignKey:"subscriberId"})
    subscriber: User;

    @BelongsTo(() => User,{as:"subscribedUser",foreignKey:"subscribedUserId"})
    subscribedUser: User;
}