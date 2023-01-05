import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/user.model';
import { Subscription } from './subscription.model';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';

@Module({
  providers: [SubscriptionService],
  imports:[
    SequelizeModule.forFeature([User,Subscription])
  ],
  exports:[SubscriptionService],
  controllers: [SubscriptionController]
})
export class SubscriptionModule {}
