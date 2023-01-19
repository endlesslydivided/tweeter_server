import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { TransactionInterceptor } from '../transactions/transaction.interceptor';
import { TransactionParam } from '../transactions/transactionParam.decorator';
import { DialogService } from './dialog.service';
import { Dialog } from './dialog.model';
import { CreateDialogDto } from './dto/createDialog.dto';
import { UpdateDialogDto } from './dto/updateDialog.dto';
import { AuthJWTGuard } from '../auth/guards/auth.guard';
import { QueryParamsPipe } from '../requestFeatures/queryParams.pipe';
import QueryParameters from '../requestFeatures/query.params';

@ApiTags("Dialogs")
@Controller("dialogs")
@UseGuards(AuthJWTGuard)
export class DialogController {

  constructor(private dialogsService: DialogService ) {
  }

  @ApiOperation({ summary: "Dialog creation" })
  @ApiOkResponse({ type: Dialog })
  @UseInterceptors(TransactionInterceptor)
  @Post()
  createDialog(@Body() dialogDto: CreateDialogDto, @TransactionParam() transaction: Transaction) {
    return this.dialogsService.createDialog(dialogDto, transaction);
  }

  @ApiOperation({ summary: "Update dialog by id" })
  @ApiOkResponse()
  @Put(`/:id`)
  updateDialog(@Body() dialogDto: UpdateDialogDto, @Param("id") id: string) {
    return this.dialogsService.updateDialog(id, dialogDto);
  }

  @ApiOperation({ summary: "Delete a dialog" })
  @ApiNoContentResponse()
  @Delete("/:id")
  deleteDialog(@Param("id") id: string) {
    return this.dialogsService.deleteDialog(id);
  }
  
  @ApiOperation({ summary: "Get a dialog" })
  @ApiOkResponse({ type: Dialog })
  @Get("/:id")
  getDialog(@Param("id") id: string) {
    return this.dialogsService.getDialogById(id);
  }

  @ApiOperation({ summary: "Get paged dialog's messages" })
  @ApiOkResponse({ type: "{rows:Message[],count:number}" })
  @Get("/:id/messages")
  getPagedMessageByDialog(@Param("id") dialogId: string,@Query(new QueryParamsPipe()) filters: QueryParameters) {
    return this.dialogsService.getMessagesByDialog(dialogId, filters);
  }
}