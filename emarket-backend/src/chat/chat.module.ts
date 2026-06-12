import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';

@Module({
    imports: [PrismaModule, AuthModule],
    providers: [ChatService, ChatGateway],
    controllers: [ChatController],
})
export class ChatModule { }
