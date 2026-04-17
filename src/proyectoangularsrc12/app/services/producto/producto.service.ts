import { Injectable } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UsuarioService } from '../usuario/usuario.service';
import { BASE_URL } from '../../config/config';
import { Observable } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { SearchPipe } from '../../pipes/SearchPipe.pipe';
import { _throw as throwError } from 'rxjs/observable/throw';
import Swal from 'sweetalert2';
import { response } from 'express';
import { LoginService } from '../login/login.service';

@Injectable()
export class ProductoService {
  producto: Producto[] = [];


  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }


  getProductoByCodErp(codProductoErp: string): Observable<any> {
    return this.http.get(BASE_URL + 'productos/getByCodErp?codProductoErp=' + codProductoErp).pipe(
       map((response: any) => {
        return response;
      }),
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }


  traerProductos() {
    let url = BASE_URL + 'productos';
    return this.http.get(url)
      .map((resp: any) => resp);
  }

  traerProductosPorTermino(termino) {
    let url = BASE_URL + 'productos?keyword=' + termino;
    return this.http.get(url)
      .map((resp: any) => resp);
  }


  traerProductosPorPaginas(page: number, termino: string) {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'productos?size=16&page=' + page;
    } else {
      url = BASE_URL + 'productos?size=16&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }


  traerProductosActivosPorPaginas(page: number, termino: string, codCategoria?: number) {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'productos?size=16&page=' + page + '&activo=true';
    } else {
      url = BASE_URL + 'productos?size=16&page=' + page + '&activo=true' + '&keyword=' + termino;
    } if (codCategoria > 0) {
      url = BASE_URL + 'productos?size=16&page=' + page + '&activo=true' + '&keyword=' + termino + '&codCategoria=' + codCategoria;

    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }

  traerProductosPorPaginasComponente(page: number, termino: string): Observable<any[]> {
    let url = '';
    if (termino === '') {
      url = BASE_URL + 'productos?size=10&page=' + page;
    } else {
      url = BASE_URL + 'productos?size=10&page=' + page + '&keyword=' + termino;
    }
    console.log(url);
    return this.http.get(url)
      .map((response: any) => response);
  }

  getImagen(nombre: string) {
    let url = BASE_URL + 'productos/download-image/' + nombre;
    return this.http.get(url, { responseType: 'blob' });
    // .map( data => data);
  }

  guardarImagenProducto(imagen, id) {
    let body = { 'image': imagen, 'id': id }
    return this.http.post<any>(BASE_URL + 'productos/upload-image', body).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  uploadImage(imagen, code): Observable<any> {

    let formData: FormData = new FormData();
    formData.append('id', code);
    formData.append('image', imagen);
    let url = BASE_URL + 'productos/upload-image';
    return this.http.post(url, formData)
      .map((response: any) => {
        console.log(response)
        return response;
      });

  }
  getProductos(page: number): Observable<any> {
    return this.http.get(BASE_URL + 'productos?page=' + page).pipe(
      /*  tap((response: any) => {
         console.log('PRoductoService: tap 1');
         (response.content as Producto[]).forEach(producto => console.log(producto.nombreProducto));
       }), */
      map((response: any) => {
        (response.content as Producto[]).map(producto => {
          producto.nombreProducto = producto.nombreProducto.toUpperCase();
          // let datePipe = new DatePipe('es');
          // cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy');
          // cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyyy', 'es');
          return producto;
        });
        return response;
      }),
      tap(res => {
        console.log('PRoductoService: tap 2');
        (res.content as Producto[]).forEach(producto => console.log(producto.nombreProducto));
      })
    );
  }


  buscarProducto(termino: string) {
    let url = BASE_URL + 'productos?page=0' + '&keyword=' + termino;

    console.log(url);
    return this.http.get(url)
      .map((respo: any) => {
        return respo.content;
      });
  }
  /*    traerProductosPorPaginas : Observable<any>
        No lo utilizo porque el pipe repite las busquedas por terminos, buscando "ins" busca "i,","in","ins"
        no utilizo el tap porque solo imprime respuesta
        no utilizo el map porque lo mapeo despues del subscribe
 */
  /* traerProductosPorPaginas(page: number, termino: string)  {
     let url = '';
     if (termino === '') {
        url = BASE_URL + 'productos?page=' + page;
      }else {
        url = BASE_URL + 'productos?page=' + page + '&keyword=' + termino;
     }
     console.log(url);
    return this.http.get(url ).pipe(
      tap((response: any) => {
        (response.content as Producto[]).forEach(producto =>
         console.log(producto.nombreProducto)
       );
      }),
      map((response: any) => {
        (response.content as Producto[]).map(producto => {
          producto.nombreProducto = producto.nombreProducto.toUpperCase();
          return producto;
        });
        return response;
      }),
      tap(response => {
        (response.content as Producto[]).forEach(producto =>
         console.log(producto.nombreProducto)
          );
      })
    );
   }*/


  create(producto: Producto) {
    return this.http.post<any>(BASE_URL + 'productos', producto)
      .pipe(
        tap((respons: any) => respons.producto as Producto),
        catchError(e => {
          console.error('ERROR', e.error);
          Swal.fire(e.error.header, e.error.message, 'error');
          return throwError(e);
        })
      );
  }

  getProducto(id): Observable<Producto> {
    return this.http.get<Producto>(BASE_URL + 'productos' + `/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/productos']);
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  updateProducto(producto: Producto): Observable<any> {
    return this.http.put<any>(BASE_URL + 'productos', producto).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

  deleteProducto(id: number): Observable<Producto> {
    return this.http.delete<Producto>(BASE_URL + 'productos' + `/${id}`).pipe(
      catchError(e => {
        console.error('ERROR', e.error);
        Swal.fire(e.error.header, e.error.message, 'error');
        return throwError(e);
      })
    );
  }

}
