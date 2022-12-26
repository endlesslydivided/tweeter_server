import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize, { Transaction } from 'sequelize';
import { Op } from 'sequelize';
import { FilterUserParams } from 'src/requestFeatures/filterUser.params';
import { Subscription } from 'src/subscription/subscription.model';
import { Tweet } from 'src/tweet/tweet.model';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { User } from './user.model';

@Injectable()
export class UserService {

    constructor(@InjectModel(User) private userRepository: typeof User)
    {}

    async createUser(dto: CreateUserDto,transaction:Transaction) 
    {
        return await this.userRepository.create(dto,{transaction});
    }


    async getUserByEmail(email: string) 
    {
        return await this.userRepository.findOne({ where: { email }});
    }

    async getUserById(id: number) 
    {
    return await this.userRepository.findByPk(id, {include: [
        {model:Tweet},
        {model:Subscription},
    ],
    attributes:['id','firstName','lastName','email','city','country','sex',
                'emailConfirmed','phoneNumber','mainPhoto']
    });
    }

    async getUsers(filters: FilterUserParams) 
    {
        const searchTerms = filters.search.toLowerCase().trim().split(' ');
        const whereClause = 
        {
            [Op.and]: 
            [
                sequelize.where(sequelize.col('country'), { [Op.like]: `%${filters.country}%` } ),
                sequelize.where(sequelize.col('sex'), { [Op.like]: `%${filters.sex}%` } ),
                sequelize.where(sequelize.col('city'), { [Op.like]: `%${filters.city}%` } ),
                sequelize.where(sequelize.col('photo.path'), filters.havePhoto === 'true' ?  {[Op.ne]: null} : {[Op.or]:{[Op.eq]: null,[Op.ne]: null}} ),
                sequelize.where(
                sequelize.fn('CONCAT',
                sequelize.fn('LOWER', sequelize.col('firstName')),
                sequelize.fn('LOWER', sequelize.col('surname')))
                , {[Op.like]: `%${filters.search.toLowerCase().replace(' ','').trim()}%`})
            ],
            [Op.or]: 
            [
            ...searchTerms.map(x =>sequelize.where(sequelize.fn('LOWER', sequelize.col('surname')), {[Op.like]: `%${x}%`})),
            ...searchTerms.map(x =>sequelize.where(sequelize.fn('LOWER', sequelize.col('firstName')), {[Op.like]: `%${x}%`})),          
            ]
        }
        const users = await this.userRepository.findAndCountAll({
            limit: filters.limit,
            offset: filters.offset,
            subQuery: false,
            where: whereClause,
            order: [[filters.orderBy,filters.orderDirection]]
        }).catch((error) =>console.log(error))
        return  users;
    }

    async updateUserById(id, dto: UpdateUserDto) 
    {
        const user = await this.userRepository.findByPk(id);

        return user.update(dto);
    }

}
