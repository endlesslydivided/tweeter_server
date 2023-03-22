import { AfterFind, BelongsTo, Column, CreatedAt, DataType, Default, ForeignKey, HasOne, Model, Table, UpdatedAt } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Tweet } from "src/tweet/tweet.model";
import { User } from "src/user/user.model";
import { Message } from "src/message/message.model";

interface MediaCreationAttribute {
  path: string;
  tweetRecordId: string;
  messageRecordId:string;
  description: string;
  originalName: string;
  type: string;
}

@Table({ tableName: "media" })
export class Media extends Model<Media, MediaCreationAttribute> {

    //Data fields
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001", description: "Unique media identifier" })
    @Default(DataType.UUIDV4)
    @Column({ type: DataType.UUID, allowNull:false, primaryKey: true })
    id: number;

    @ApiProperty({ example: "./media/234awEw909weqdW23ed.jpeg", description: "Media path on server" })
    @Column({ type: DataType.STRING, allowNull: false })
    path: string;

    @ApiProperty({ example: "media.jpeg", description: "Media original filename"})
    @Column({ type: DataType.STRING, allowNull: false })
    originalName: string;

    @ApiProperty({ example: "image", description: "Media type"})
    @Column({ type: DataType.STRING, allowNull: false })
    type: string;

    //Tweet record foreign key
    @ApiProperty({ example: "0", description: "ID of tweet record" })
    @ForeignKey(() => Tweet)
    @Column({ type: DataType.UUID, allowNull: true })
    tweetRecordId: string;

    @BelongsTo(() => Tweet,{foreignKey:"tweetRecordId",constraints:true,onDelete:"cascade"})
    tweetRecord: Tweet;

    //Message record foreign key
    @ApiProperty({ example: "0", description: "ID of message record" })
    @ForeignKey(() => Message)
    @Column({ type: DataType.UUID, allowNull: true })
    messageRecordId: string;

    @BelongsTo(() => Message,{foreignKey:"messageRecordId",constraints:true,onDelete:"cascade"})
    messageRecord: Message;

    @HasOne(() => User,"mainPhotoId")
    userMainPhoto: User;
  
    @HasOne(() => User,"profilePhotoId")
    userProfilePhoto: User;

 


}