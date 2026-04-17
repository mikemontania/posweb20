import { Injectable } from '@angular/core';
import { FormaPago } from '../../models/formaPago.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
 
@Injectable()
export class FormaPagoService {

  forma: FormaPago[] = [];

  headers: HttpHeaders; // new HttpHeaders();

  constructor(
                public http: HttpClient,
                public router: Router,
               ) {  }

}
