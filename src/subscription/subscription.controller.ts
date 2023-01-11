import { Body, Controller, Delete, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { AuthJWTGuard } from 'src/auth/guards/auth.guard';
import { TransactionInterceptor } from 'src/transactions/transaction.interceptor';
import { TransactionParam } from 'src/transactions/transactionParam.decorator';
import { UpdateUserDTO } from 'src/user/dto/updateUser.dto';
import { CreateSubsriptionDTO } from './dto/createSubscription.dto';
import { UpdateSubscriptionDTO } from './dto/updateSubscription.dto';
import { Subscription } from './subscription.model';
import { SubscriptionService } from './subscription.service';

@Controller('subscriptions')
@UseGuards(AuthJWTGuard)
export class SubscriptionController {

  constructor(private subsService: SubscriptionService) {
  }

  @ApiOperation({ summary: "Subscribtion creation" })
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
  @Delete("/:id")
  deleteSubscription(@Param("id") id: string) {
    return this.subsService.deleteSubscriptionById(id);
  }
}
