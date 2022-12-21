import { AfterFind, BelongsTo, Column, CreatedAt, DataType, Default, ForeignKey, HasOne, Model, Table, UpdatedAt } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Tweet } from "src/tweet/tweet.model";

interface MediaCreationAttribute {
  path: string;
  order: number;
  attachableId: number;
  attachableType: string;
}

@Table({ tableName: "media" })
export class Media extends Model<Media, MediaCreationAttribute> {

    //Data fields
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174001", description: "Unique media identifier" })
    @Default(DataType.UUIDV4)
    @Column({ type: DataType.UUID, allowNull:false, primaryKey: true })
    id: number;

    @ApiProperty({ example: "My first media", description: "Media description" })
    @Column({ type: DataType.TEXT, allowNull: true })
    description: string;

    @ApiProperty({ example: "./media/234awEw909weqdW23ed.jpeg", description: "Media path on server" })
    @Column({ type: DataType.STRING,unique:true, allowNull: false })
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

    @BelongsTo(() => Tweet,{foreignKey:"id",constraints:true,onDelete:"cascade"})
    tweetRecord: Tweet;

}