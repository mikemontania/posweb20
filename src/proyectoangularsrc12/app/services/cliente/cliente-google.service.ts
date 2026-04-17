import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from 'src/app/config/config';

@Injectable({
  providedIn: 'root'
})
export class ClienteGoogleService {

  constructor(
      public http: HttpClient,
      public router: Router,
  ) { }


  traerClientesGoogle(page: number, termino: string) {
    let url = '';
    if (termino === '') {
       url = BASE_URL + 'clientes_google?size=10&page=' + page;
     } else {
       url = BASE_URL + 'clientes_google?size=10&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
   return this.http.get(url)
     .map((response: any) => response );
  }
  
}
