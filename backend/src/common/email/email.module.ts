import { Global, Module } from '@nestjs/common';
import { EmailSenderService } from './email.service';

@Global()
@Module({
  providers: [EmailSenderService],
  exports: [EmailSenderService],
})
export class EmailModule {}
