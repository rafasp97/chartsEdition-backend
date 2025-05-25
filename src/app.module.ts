import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MainModule } from './main/main.module';
import { HttpModule } from '@nestjs/axios';
import { registerHelpers } from './handlebars.helpers';

registerHelpers();

@Module({
  imports: [MainModule,  HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
