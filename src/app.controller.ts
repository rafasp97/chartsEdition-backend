import { Controller, Post, Res, Body } from '@nestjs/common';
import { Response } from 'express'; 
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/main')
  async generateImg(@Res() res: Response, @Body('image') image: string, @Body('color') color: string,  @Body('rank') rank: any[]){
    const generatedImage = await this.appService.generateImg(image, color, rank);
    res.setHeader('Content-Type', 'image/png');
    res.send(generatedImage);
  }
} 
