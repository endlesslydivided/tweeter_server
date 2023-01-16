import { BelongsTo, Column, DataType,HasOne,CreatedAt,UpdatedAt, ForeignKey, HasMany, Model, Table, Default, BelongsToMany } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/user/user.model";
import { Media } from "src/media/media.model";
import { SavedTweet } from "./savedTweet.model";
import { LikedTweet } from "./likedTweet.model";


interface TweetCreationAttribute {
  title: string;
  description: string;
  content: string;
  categoryId: number;
  userId: number;
}

@Table({ tableName: "twitterRecord"})
export class Tweet extends Model<Tweet, TweetCreationAttribute> {

    //Data fields
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Unique tweet identifier" })
    @Default(DataType.UUIDV4)
    @Column({ type: DataType.UUID, allowNull:false, primaryKey: true })
    id: string;

    @ApiProperty({ example: "My first post content", description: "Tweet text" })
    @Column({ type: DataType.TEXT, allowNull: true })
    text: string;

    @ApiProperty({ example: "false", description: "Is tweet a comment?" })
    @Column({ type: DataType.BOOLEAN, allowNull: false })
    isComment: boolean;

    @ApiProperty({ example: "false", description: "Is tweet public?" })
    @Column({ type: DataType.BOOLEAN, allowNull: false })
    isPublic: boolean;

    //Author foreign key
    @ApiProperty({ example: "0", description: "ID of tweet author" })
    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: true })
    authorId: string;

    @BelongsTo(() => User,{foreignKey:"authorId",constraints:true,onDelete:"set null"})
    author: User;

    //Parent record author foreign key
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001", description: "ID of tweet parent record author" })
    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: true })
    parentRecordAuthorId: string;

    @BelongsTo(() => User,{foreignKey:"parentRecordAuthorId",constraints:true,onDelete:"set null"})
    parentRecordAuthor: User;

    //Parent record foreign key
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174002", description: "ID of tweet parent record" })
    @ForeignKey(() => Tweet)
    @Column({ type: DataType.UUID, allowNull: true })
    parentRecordId: string;

    @BelongsTo(() => Tweet,{foreignKey:"parentRecordId",constraints:true,onDelete:"set null"})
    parentRecord: Tweet;

    //Tweet's media
    @HasMany(() => Media,"tweetRecordId")
    tweetMedia: Media[]

    //Users, which saved or liked a tweet
    @BelongsToMany(() => User, () => SavedTweet,"tweetId")
    usersSaves: User[];

    @BelongsToMany(() => User, () => LikedTweet,"tweetId")
    usersLikes: User[];

    @HasMany(() => SavedTweet)
    savedTweets: SavedTweet[]

    @HasMany(() => LikedTweet)
    likedTweets: LikedTweet[]

}

