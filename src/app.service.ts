import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import * as puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';

interface Artist {
  name: string;
  playcount: any;
}

@Injectable()
export class AppService {

  constructor(
  
  ) {}
  

  async generateImg(image:string, color: string, rank:any[]){

    //readFileSync ler o arquivo em forma de string e o join com __dirname é uma forma de encontrar o diretório.
    const templateContent = readFileSync('/app/src/views/charts_template.hbs', 'utf-8');

    const today = new Date();
    const daysAgo = new Date();
    daysAgo.setDate(today.getDate() - 7);

    const todayFormat = this.formatDate(today);            
    const daysAgoFormat = this.formatDate(daysAgo); 

    const logoBase64 = this.imageToBase64('/app/src/images/logo.png');
    const bg = '/app/src/images/bg.png';
    const crown = this.imageToBase64('/app/src/images/crown.png');

    //Compila o conteúdo em formato string e o transforma em uma função reutilizável que pode gerar HTML a partir de dados
    const template = Handlebars.compile(templateContent);


    //conecta o template para identificar 'data' como 'artists'
    const html = template({
      artists: rank,
      logo: logoBase64,
      background: bg,
      win: image,
      crown: crown,
      today: todayFormat,
      daysAgo: daysAgoFormat,
      color: color
    });

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    //abre uma nova página no navegador.
    const page = await browser.newPage();

    //adiciona o template armazenado na constante html na página.
    await page.setContent(html, { waitUntil: 'networkidle0' });

    //renderiza a página em formato de imagem.
    const screenshot = await page.screenshot({ type: 'png' });

    await browser.close();

    return screenshot; 

  }

  private imageToBase64(path: string) {
    const bitmap = fs.readFileSync(path);
    return `data:image/${path.split('.').pop()};base64,` + bitmap.toString('base64');
  }

  private formatDate(date: Date): string {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    return `${dia}-${mes}`;
  }
}
