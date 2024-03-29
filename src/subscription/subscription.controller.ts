import { Body, Controller, Delete, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { AuthJWTGuard } from '../auth/guards/auth.guard';
import { TransactionInterceptor } from '../transactions/transaction.interceptor';
import { TransactionParam } from '../transactions/transactionParam.decorator';
import { CreateSubsriptionDTO } from './dto/createSubscription.dto';
import { DeleteSubsriptionDTO } from './dto/deleteSubscription.dto copy';
import { UpdateSubscriptionDTO } from './dto/updateSubscription.dto';
import { Subscription } from './subscription.model';
import { SubscriptionService } from './subscription.service';

@ApiTags("Subscription")
@Controller("subscriptions")
@UseGuards(AuthJWTGuard)
export class SubscriptionController {

  constructor(private subsService: SubscriptionService) {
  }

  @ApiOperation({ summary: "Subscription creation" })
  @ApiCreatedResponse({ type: Subscription })
  @UseInterceptors(TransactionInterceptor)
  @Post()
  createSubscription(@Body() dto: CreateSubsriptionDTO,@TransactionParam() transaction: Transaction
  ) {
    return this.subsService.createSubscription(dto, transaction);
  }

  @ApiOperation({ summary: "Update subscription" })
  @ApiOkResponse()
  @UseInterceptors(TransactionInterceptor)
  @Put("/:id")
  updateSubscription(@Param("id") id: string,
               @Body() dto: UpdateSubscriptionDTO) {
    return this.subsService.updateSubscription(id, dto);
  }

  @ApiOperation({ summary: "Delete subscription" })
  @ApiOkResponse()
  @UseInterceptors(TransactionInterceptor)
  @Delete()
  deleteSubscription(@Body() dto: DeleteSubsriptionDTO) {
    return this.subsService.deleteSubscriptionById(dto.subscriberId,dto.subscribedUserId);
  }
}
