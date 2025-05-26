import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
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

  users: string[] = [
    'iraaaph', 
    'guswlima', 
    'piscixxx', 
    'erikbzra', 
    'candygor', 
    'llucasmoreno5', 
    'brunocosta061', 
    'akumakoji', 
    'becamusics',
    'Edu_XS',
    'felipetas',
    'vitoriaforttes'
  ];
  artists: Artist[];

  constructor(
    private readonly http: HttpService
  ) {}
  
  async getCharts(){

    this.artists = [];

    const data = await this.getDATA();

    return this.generateImg(data);
  }


  private async getDATA(){

    for(const user of this.users){
      const data = await this.request(user);

      for(const artist of  data.topartists.artist){
        this.artists.push({
          name: artist.name,
          playcount: artist.playcount
        });
      };
    };
    
    const noRepeat = this.noRepeat();

    const rank = this.getRank(noRepeat);

    return rank;
  }

  private async request(user:string){
    try{
      const response = await firstValueFrom(
        this.http.post(`https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${user}&api_key=7d6a2403de46005e4c8b90419196d615&period=7day&format=json`)
      )
      return response.data;
    } catch(error){
      return {message: `Error: ${error}, no user ${user}`};
    }
  };

  private noRepeat(){
    return  Object.values(this.artists.reduce((all, artist) => {
      const name = artist.name;
      const playcount = parseInt(artist.playcount);

      if(!all[name]) all[name] = {name: name, playcount: playcount};
      else all[name].playcount += playcount;

      return all;
    }, {}) as Artist[]);
  };

  private getRank(artists:Artist[]) {
    return artists.sort((a:Artist, b:Artist) => b.playcount - a.playcount).slice(0, 10);
  }

  private async generateImg(data:Artist[]){

    //readFileSync ler o arquivo em forma de string e o join com __dirname é uma forma de encontrar o diretório.
    const templateContent = readFileSync('/app/src/views/charts_template.hbs', 'utf-8');

    const today = new Date();
    const daysAgo = new Date();
    daysAgo.setDate(today.getDate() - 7);

    '/app/src/images/logo.png'
    const todayFormat = this.formatDate(today);            
    const daysAgoFormat = this.formatDate(daysAgo); 

    const logoBase64 = this.imageToBase64('/app/src/images/logo.png');
    const bgBase64 = this.imageToBase64('/app/src/images/bg.jpg');
    const win = this.imageToBase64('/app/src/images/rebeca.jpg');
    const crown = this.imageToBase64('/app/src/images/crown.png');

    //Compila o conteúdo em formato string e o transforma em uma função reutilizável que pode gerar HTML a partir de dados
    const template = Handlebars.compile(templateContent);


    //conecta o template para identificar 'data' como 'artists'
    const html = template({
      artists: data,
      logo: logoBase64,
      background: bgBase64,
      win: win,
      crown: crown,
      today: todayFormat,
      daysAgo: daysAgoFormat
    });

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium', // caminho do chromium no container Docker
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
