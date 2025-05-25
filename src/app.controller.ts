import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express'; 
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/main')
  async getCharts(@Res() res: Response){
    res.setHeader('Content-Type', 'image/png');
    res.send(await this.appService.getCharts());
  }
}
