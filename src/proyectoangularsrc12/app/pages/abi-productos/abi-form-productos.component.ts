import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ABI_Producto } from 'src/app/models/abi-producto.model';
import { CategoriaProducto } from 'src/app/models/categoriaProducto.model';
import { Cliente } from 'src/app/models/cliente.model';
import { Empresas } from 'src/app/models/empresas.model';
import { UnidadMedida } from 'src/app/models/unidadMedida.model';
import { User } from 'src/app/models/user.model';
import { CategoriaService, UnidadMedidaService, LoginService, EmpresasService,AbiProductoService  } from 'src/app/services/service.index';
 import Swal from 'sweetalert2';

import swal from 'sweetalert2';


@Component({
  selector: 'app-abi-form-productos',
  templateUrl: './abi-form-productos.component.html',
  styles: []
})
export class AbiFormProductosComponent implements OnInit {
  cliente: Cliente;
  producto: ABI_Producto = new ABI_Producto();
  nombreProducto: string;
  nombreCliente: string;
  empresa: Empresas;
  imagenSubir: File;
  imagenTemp: any;
  sinImagen: string = './assets/images/sin-imagen.jpg';
  unidadMedida: UnidadMedida[] = [];
  categoriaProducto: CategoriaProducto[] = [];
  seleccionCategoria: number;
  seleccionUnidad: number;
  user: User;
  constructor(private _categoriaServices: CategoriaService,
    private _unidadMedidaServices: UnidadMedidaService,
    private toastr: ToastrService,
    private _loginService: LoginService,
    private _empresaServicies: EmpresasService,
    private _productoAbiService: AbiProductoService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
      this.producto.id= null;
      this.producto.descripcion= '';
      this.producto.categoria=null;
      this.producto.nombre='';
      this.producto.descripcion_extensa='';
      this.producto.etiquetas='';
      this.producto.cantidad_mayorista=0;
      this.producto.precio=0;
      this.producto.precio_mayorista=0;
      this.producto.cantidad_disponible=0;
      this.producto.peso_kg=0;
      this.producto.ancho_cm=0;
      this.producto.profundidad_cm=0;
      this.producto.refrigeracion=0;
      this.producto.fabricante=0;
      this.producto.activo=true;
      this.producto.api_extra_data='';
      this.producto.imagenes=[]; 
  }

  ngOnInit() {
    this.user = this._loginService.user;
  
    this.activatedRoute.paramMap.subscribe(async params => {
      let id = +params.get('id');
      if (id) {
        this.producto= await this.getProductoById(id);
          console.log(this.producto)
      }
    });
  }

  async getProductoById(id: number) {
    let producto = this._productoAbiService.getProducto(id).toPromise();
    return producto;
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 1500 });
  }
  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }

  create(): any {
    
    this._productoAbiService.create(this.producto)
      .subscribe(
        (producto: ABI_Producto) => {
          
          swal.fire('Nuevo Producto', `El producto ${this.producto.nombre} ha sido creado con éxito`, 'success');
        },
        err => {
          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
          console.error('Código del error desde el backend: ' + err.status);
        }
      );
  }

  update(): void {
    this._productoAbiService.updateProducto(this.producto)
      .subscribe(
        (json: ABI_Producto) => {
          swal.fire('Producto Actualizado', `producto  : ${this.producto.nombre}`, 'success');
        },
        err => {
          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
          console.error('Código del error desde el backend: ' + err.status);
        }
      );
  }

  

  seleccionImage(archivo: File) {
    // si  no existe no hacer nada
    if (!archivo) {
      this.imagenSubir = null;
      return;
    }
    if (archivo.type.indexOf('image') < 0) {
      swal.fire('Sólo imágenes', 'El archivo seleccionado no es una imagen', 'error');
      this.imagenSubir = null;
      return;
    }
    this.imagenSubir = archivo;
    let reader = new FileReader();
    let urlImagenTemp = reader.readAsDataURL(archivo);
    reader.onloadend = () => {
      console.log(reader.result);
      this.imagenTemp = reader.result;
    };
    this._productoAbiService.uploadImage(this.imagenSubir, this.producto.id).subscribe(async (producto:ABI_Producto) => {
      this.producto = producto;
      this.imagenTemp = null;
      $('#uploadedfile').val(null);
    
    });
  }

  delete(id:number): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar la imagen  ?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-outline-success ml-1',
      cancelButtonClass: 'btn btn-outline-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this._productoAbiService.deleteImagenProducto(id).subscribe(
          () => {
            this.producto.imagenes=[];
            Swal.fire(
              'Imagen Eliminada!',
              `Imagen eliminada con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }


  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

  cambiarImagen(cod) {
    this._productoAbiService.uploadImage(this.imagenSubir, cod).subscribe((producto:ABI_Producto) => {
      this.imagenTemp = null;
      $('#uploadedfile').val(null);
    
    });
  }

}
