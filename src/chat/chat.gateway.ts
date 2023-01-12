import { forwardRef, Inject, Logger, UseGuards } from '@nestjs/common';
import {SubscribeMessage,WebSocketGateway,OnGatewayInit,WebSocketServer,OnGatewayConnection,OnGatewayDisconnect, MessageBody,} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { DialogService } from 'src/dialog/dialog.service';
import { MessageService } from 'src/message/message.service';
import RequestParameters from 'src/requestFeatures/request.params';
import { UserService } from 'src/user/user.service';
import { AuthJWTGuard } from '../auth/guards/auth.guard';
import { CreateMessageDto } from '../message/dto/createMessage.dto';

enum ChatClientEvent 
{
    ReceiveMessage = 'receive_message',
    ReceiveDialogs = 'receive_dialogs',
    DialogMessages = 'dialog_messages',
}

enum ChatServerEvent 
{
    SendMessage = 'send_message',
    GetDialogMessages = 'get_dialog_messages',
    GetDialogs = 'get_dialogs',
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

  
  @SubscribeMessage(ChatServerEvent.SendMessage)
  handleSendMessage(@MessageBody() body: Message) 
  {
    return this.messagesService.createMessage(body.dto).then(async (message) =>
    {
      this.server.to(body.fromUserId.toString()).emit(ChatClientEvent.ReceiveMessage, 
        {message,userId:body.fromUserId,dialogId:body.dto.dialogId});
      this.server.to(body.toUserId.toString()).emit(ChatClientEvent.ReceiveMessage, 
        {message,user:body.fromUserId,dialogId:body.dto.dialogId});

    });
    
  }

  @SubscribeMessage(ChatServerEvent.GetDialogMessages)
  async handleGetDialogMessages(@MessageBody() body: any  & {dialogId:string,filters:RequestParameters}) 
  {
    const messages = this.dialogsService.getMessagesByDialog(body.dialogId,body.filters);
    messages.then((messages) =>
    {
      this.server.to(body.auth.id.toString()).emit(ChatClientEvent.ReceiveMessage, {messages,dialogId:body.dialogId});
    })
  }

  @SubscribeMessage(ChatServerEvent.GetDialogs)
  async handleGetDialogs(@MessageBody() body: any & {userId:string,filters:RequestParameters}) 
  {
    const dialogs = this.userService.getDialogsByUser(body.userId,body.filters);
    dialogs.then((dialogs) =>
    {
      this.server.to(body.auth.id.toString()).emit(ChatClientEvent.ReceiveDialogs, dialogs);
    })
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
    
    if(auth.dialogId && auth.id)    client.join(auth.dialogId.toString() + auth.id.toString());
    if(auth.dialogId)      client.join(auth.dialogId.toString())
    if(auth.id)      client.join(auth.id.toString())

    this.logger.log(`Client connected: ${client.id}`);
  }
}