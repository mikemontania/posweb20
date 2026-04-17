import { Observable } from 'rxjs';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from '../login/login.service';
import { ABI_PATH, ABI_TOKEN } from '../../config/config';

@Injectable()
export class InterceptorService implements HttpInterceptor {
  constructor(public _loginService: LoginService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if (request.url.includes(ABI_PATH)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Token ${ABI_TOKEN}`
        }
      });
    }else{
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this._loginService.token}`
        }
      });
    }

    return next.handle(request);
  }
}
