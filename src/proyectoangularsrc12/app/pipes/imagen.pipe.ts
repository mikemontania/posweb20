import { Pipe, PipeTransform } from '@angular/core';
import {  BASE_URL } from '../config/config';
import {   HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';

@Pipe({
  name: 'imagen'
})
export class ImagenPipe implements PipeTransform {

  constructor(
    public http: HttpClient,
    private sanitizer: DomSanitizer
   ) {
  }

  transform( img: string, tipo: string): Observable<SafeUrl> {
    let url = BASE_URL + tipo + '/download-image/' + img;

      return this.http.get(url, {  responseType: 'blob'})
       .map(val => this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(val)));
  }

}
