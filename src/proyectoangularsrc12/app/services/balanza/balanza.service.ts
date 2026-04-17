import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";

import { driver_url } from "src/app/config/config";
import { catchError, map } from "rxjs/operators";


@Injectable ({
    providedIn: 'root'
})

export class BalanzaService {

    constructor ( private http: HttpClient ) {}

    verificarConexionBalanza(): Observable<boolean> {
        return this.http.get<boolean>(`${driver_url}/balanza/checkbalanza`)
        .pipe(
          map((response: any) => response),
          catchError(e => {           console.error('ERROR', e.error);             return of(false)         })
        )
    }

    obtenerPesoBalanza(): Observable<number> {
        const url = `${driver_url}/balanza/peso`;
        return this.http.get<number>(url)
        .pipe(
          map((response: any) => response),
          catchError(e => {           console.error('ERROR', e.error);             return throwError(e);          })
        )
    }
}
