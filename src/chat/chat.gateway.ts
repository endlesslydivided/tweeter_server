import { forwardRef, Inject, Logger, UseGuards } from '@nestjs/common';
import {SubscribeMessage,WebSocketGateway,OnGatewayInit,WebSocketServer,OnGatewayConnection,OnGatewayDisconnect, MessageBody,} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { DialogService } from 'src/dialog/dialog.service';
import { MessageService } from 'src/message/message.service';
import QueryParameters from 'src/requestFeatures/query.params';
import { UserService } from 'src/user/user.service';
import { AuthJWTGuard } from '../auth/guards/auth.guard';
import { CreateMessageDto } from '../message/dto/createMessage.dto';

export enum ChatClientEvent 
{
    SERVER_SENDS_MESSAGE = 'SERVER_SENDS_MESSAGE',
    SERVER_SENDS_DIALOGS= 'SERVER_SENDS_DIALOGS',
    SERVER_SENDS_DIALOG_MESSAGES = 'SERVER_SENDS_DIALOG_MESSAGES',
    SERVER_RETURNS_MESSAGE = 'SERVER_RETURNS_MESSAGE',
    SERVER_SENDS_DIALOG = 'SERVER_SENDS_DIALOG',
}

export enum ChatServerEvent 
{
    CLIENT_SEND_MESSAGE = 'CLIENT_SEND_MESSAGE',
    CLIENT_GET_DIALOG_MESSAGES = 'CLIENT_GET_DIALOG_MESSAGES',
    CLIENT_GET_DIALOGS = 'CLIENT_GET_DIALOGS',
    CLIENT_GET_DIALOG = 'CLIENT_GET_DIALOG',
}

type Message = CreateMessageDto &
{
    dto:CreateMessageDto;
    fromUserId:string;
    toUserId: string;
}

@WebSocketGateway(5001,{cors: { origin:  true, credentials: true, preflightContinue: false},path:"/chat"})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect 
{
  constructor( @Inject(forwardRef(() => MessageService)) private messagesService: MessageService,
  @Inject(forwardRef(() => UserService)) private userService: UserService,
  @Inject(forwardRef(() => DialogService)) private dialogsService: DialogService)
  {

  }

  private logger: Logger = new Logger('ChatGateway');


  @WebSocketServer() 
  server: Server;

  
  @SubscribeMessage(ChatServerEvent.CLIENT_SEND_MESSAGE)
  async handleSendMessage(@MessageBody() body: Message & {fromUserId:string, toUserId:string}) 
  {
    const message =await this.messagesService.createMessage(body.dto);
    const user = await this.userService.getUserDataById(body.fromUserId);
    this.server.to(body.fromUserId.toString()).emit(ChatClientEvent.SERVER_RETURNS_MESSAGE,
      {message,user,dialogId:body.dto.dialogId});
    this.server.to(body.toUserId.toString()).emit(ChatClientEvent.SERVER_SENDS_MESSAGE, 
      {message,user,dialogId:body.dto.dialogId});
  }

  @SubscribeMessage(ChatServerEvent.CLIENT_GET_DIALOG_MESSAGES)
  async handleGetDialogMessages(@MessageBody() body: any  & {dialogId:string,filters:QueryParameters}) 
  {
    const messages = this.dialogsService.getMessagesByDialog(body.dialogId,body.filters);
    messages.then((messages) =>
    {
      this.server.to(body.auth.id.toString()).emit(ChatClientEvent.SERVER_SENDS_DIALOG_MESSAGES, {messages,dialogId:body.dialogId});
    })
  }

  @SubscribeMessage(ChatServerEvent.CLIENT_GET_DIALOGS)
  async handleGetDialogs(@MessageBody() body: any & {userId:string,filters:QueryParameters}) 
  {
    const dialogs = this.userService.getDialogsByUser(body.userId,body.filters);
    dialogs.then((dialogs) =>
    {
      this.server.to(body.auth.id.toString()).emit(ChatClientEvent.SERVER_SENDS_DIALOGS, dialogs);
    })
  }

  @SubscribeMessage(ChatServerEvent.CLIENT_GET_DIALOG)
  async handleGetDialog(@MessageBody() body: any & {dialogId:string}) 
  {
    const dialog= await this.dialogsService.getDialogById(body.dialogId,body.auth.id.toString());
    this.server.to(body.auth.id.toString()).emit(ChatClientEvent.SERVER_SENDS_DIALOG, dialog);
  }

  afterInit(server: Server) 
  {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) 
  {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(AuthJWTGuard)
  handleConnection(client: Socket,...args: any[]) 
  {
    const auth = client.handshake.auth;

    if(auth.id)  client.join(auth.id.toString())

    this.logger.log(`Client connected: ${client.id}`);
  }
}