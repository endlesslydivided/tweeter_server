import { ApiProperty } from "@nestjs/swagger";
import {BelongsTo,BelongsToMany,Column,CreatedAt,DataType,Default,ForeignKey,HasMany,HasOne,Model,Table, UpdatedAt} from "sequelize-typescript";
import { Dialog } from "src/dialog/dialog.model";
import { UserDialog } from "src/dialog/userDialog.model";
import { Media } from "src/media/media.model";
import { Message } from "src/message/message.model";
import { Subscription } from "src/subscription/subscription.model";
import { LikedTweet } from "src/tweet/likedTweet.model";
import { SavedTweet } from "src/tweet/savedTweet.model";
import { Tweet } from "src/tweet/tweet.model";

  
interface UserCreationAttribute {
    firstname: string;
    emailConfirmed: boolean;
    surname: string;
    email: string;
    password: string;
    salt: string;
    sex:string;
    country:string;
    city:string;
}
  
@Table({tableName:'user'})
export class User extends Model<User,UserCreationAttribute> 
{
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Unique user identifier" })
    @Default(DataType.UUIDV4)
    @Column({ type: DataType.UUID, allowNull:false, primaryKey: true })
    id: string;

    @ApiProperty({ example: "Alexander", description: "User's firstname" })
    @Column({ type: DataType.STRING, allowNull: false })
    firstname: string;

    @ApiProperty({ example: "Kovalyov", description: "User's lastname" })
    @Column({ type: DataType.STRING, allowNull: false })
    surname: string;

    @ApiProperty({ example: "user@do.mail", description: "User's email" })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    email: string;

    @ApiProperty({ example: "false", description: "Is user's email confirmed?" })
    @Default(false)
    @Column({ type: DataType.BOOLEAN, allowNull: false })
    emailConfirmed: boolean;
  
    @ApiProperty({ example: "12345", description: "User's password hash" })
    @Column({ type: DataType.STRING, unique: false, allowNull: false })
    password: string;

    @ApiProperty({ example: "12345", description: "User's password hash salt" })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    salt: string;

    @ApiProperty({ example: "Man", description: "Sex" })
    @Column({ type: DataType.STRING, allowNull: false})
    sex: string;

    @ApiProperty({ example: "Belarus", description: "User's country of living" })
    @Column({ type: DataType.STRING, allowNull: false})
    country: string;

    @ApiProperty({ example: "Minsk", description: "User's city of living" })
    @Column({ type: DataType.STRING, allowNull: false})
    city: string;

    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Failed attempts to access user's account" })
    @Default(0)
    @Column({ type: DataType.INTEGER })
    accessFailedCount: number;

    //User's tweets
    @HasMany(() => Tweet,{as:'tweets',foreignKey:'authorId'})
    tweets: Tweet[]

    @HasMany(() => Tweet,"parentRecordAuthorId")
    userTweetsComments: Tweet[]

    //User's saved and liked tweets
    @BelongsToMany(() => Tweet, () => SavedTweet,"userId")
    savedTweets: Tweet[];

    @BelongsToMany(() => Tweet, () => LikedTweet,"userId")
    likedTweets: Tweet[];

    //User's subscribers and subcribtions
    @HasMany(() => Subscription,{as:'followers',foreignKey:'subscribedUserId'})
    followers: Subscription[]

    @HasMany(() => Subscription,{as:'following',foreignKey:'subscriberId'})
    subscriptions: User[];

    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "ID of main photo" })
    @ForeignKey(() => Media)
    @Column({ type: DataType.UUID })
    mainPhotoId: number;

    @BelongsTo(() => Media, {
        foreignKey: "mainPhotoId",
        constraints: false, onDelete: "set null", onUpdate: "cascade"
      })
    mainPhoto: Media;

    @BelongsToMany(() => Dialog, () => UserDialog)
    dialogs: Dialog[];

    @HasMany(() => Dialog, {
        foreignKey: "creatorId",
        constraints: true, onDelete: "cascade", onUpdate: "cascade"
    })
    createdDialogs: Dialog[];

    @HasMany(() => Message, {
        foreignKey: "userId",
        constraints: true, onDelete: "set null", onUpdate: "cascade"
    })
    messages: Message[];

    @HasMany(() => UserDialog)
    userDialog: UserDialog[]

    
}