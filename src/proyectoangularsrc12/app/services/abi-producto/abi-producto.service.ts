import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { _throw as throwError } from 'rxjs/observable/throw';
import Swal from 'sweetalert2';
 
import { ABI_PATH } from 'src/app/config/config';
import { ABI_Producto } from 'src/app/models/abi-producto.model';

@Injectable()
export class AbiProductoService {
 
  constructor(
    public http: HttpClient,
    public router: Router 
  ) {
   

   }
 
   getProductosPorPaginas(page: number, size: number, termino:string) {
    let url = ABI_PATH+'/producto/?page='+page+'&page_size='+size;
    if (termino.length>0) {
        url = url +'&search='+termino;
    }
     console.log(url);
   return this.http.get(url )
   .pipe(
    catchError(e => {
      console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
      return throwError(e);
    })
  );
     
  }


  getProducto(id): Observable<ABI_Producto> {
    return this.http.get<ABI_Producto>(ABI_PATH+ `/producto/${id}/` ).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
 
  uploadImage( imagen , codeProducto ): Observable <any> {
    let formData: FormData = new FormData();
    formData.append('producto', codeProducto);
    formData.append('imagen', imagen);
    let url = ABI_PATH+ '/imagen_producto/';
    return this.http.post( url, formData)
    .map((response: any) => {
  console.log(response)
      return response;
    });
  
  }
  

  deleteProducto(id: number)  {
    return this.http.delete (ABI_PATH+ `/producto/${id}/` ).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }
  deleteImagenProducto(id: number)  {
    return this.http.delete (ABI_PATH+ `/imagen_producto/${id}/`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  updateProducto(producto: ABI_Producto) {
    return this.http.patch<ABI_Producto>( ABI_PATH+ `/producto/${producto.id}/`, producto ).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
            Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  create(producto: ABI_Producto){
    return this.http.post<ABI_Producto>(ABI_PATH+ '/producto/', producto )
      .pipe(
        tap((response: any) => response as ABI_Producto),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

/*
   traerProductos() {
    let url = BASE_URL + 'productos';
    return this.http.get( url, { headers: this.headers})
    .map( (resp: any) => resp);
  }

  traerProductosPorTermino(termino) {
    let url = BASE_URL + 'productos?keyword=' + termino;
    return this.http.get( url, { headers: this.headers})
    .map( (resp: any) => resp);
  }


  traerProductosPorPaginas(page: number, termino: string) {
    let url = '';
    if (termino === '') {
       url = BASE_URL + 'productos?size=18&page=' + page;
     } else {
       url = BASE_URL + 'productos?size=18&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
   return this.http.get(url, { headers: this.headers})
     .map((response: any) => response );
 }

 

 getImagen(nombre: string) {
  let url = BASE_URL + 'productos/download-image/' + nombre;
  return this.http.get(url, { headers: this.headers, responseType: 'blob'});
}

guardarImagenProducto(imagen, id) {
  let body = {'image': imagen, 'id': id }
  return this.http.post<any>(BASE_URL + 'productos/upload-image', body, { headers: this.headers }).pipe(
    catchError(e => {
      console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
      return throwError(e);
    })
  );
}

uploadImage( imagen , code ): Observable <any> {
  this.headers = new HttpHeaders({
    'Authorization': 'Bearer ' + this._loginService.token
  });
  let formData: FormData = new FormData();
  formData.append('id', code);
  formData.append('image', imagen);
  let url = BASE_URL + 'productos/upload-image';
  return this.http.post( url, formData, { headers: this.headers })
  .map((response: any) => {
console.log(response)
    return response;
  });

}


create(producto: Producto){
  return this.http.post<any>(BASE_URL + 'productos', producto, { headers: this.headers })
    .pipe(
      tap((response: any) => response.producto as Producto),
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
}



updateProducto(producto: Producto): Observable<any> {
  return this.http.put<any>(BASE_URL + 'productos', producto, { headers: this.headers }).pipe(
    catchError(e => {
      console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
      return throwError(e);
    })
  );
}

deleteProducto(id: number): Observable<Producto> {
  return this.http.delete<Producto>(BASE_URL + 'productos' + `/${id}`, { headers: this.headers }).pipe(
    catchError(e => {
      console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
      return throwError(e);
    })
  );
}
*/

}
