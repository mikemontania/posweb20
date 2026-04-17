import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { CategoriaService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
 import { User } from '../../models/user.model';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto/producto.service';
import { UnidadMedidaService } from '../../services/unidadMedida/unidadMedida.service';
import { CategoriaProducto } from '../../models/categoriaProducto.model';
import { Empresas } from '../../models/empresas.model';
import { EmpresasService } from '../../services/empresas/empresas.service';
 import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { UnidadMedida } from '../../models/unidadMedida.model';

@Component({
  selector: 'app-form-productos',
  templateUrl: './form-productos.component.html',
  styles: []
})
export class FormProductosComponent implements OnInit {
  cliente: Cliente;
  producto: Producto = new Producto();
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
    private _productoService: ProductoService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.producto.codProductoErp = '';
    this.producto.nombreProducto = '';
    this.producto.descripcion = '';
    this.producto.codBarra = '';
    this.producto.marca = '';
    this.producto.grupo = '';
    this.producto.subGrupo = '';
    this.producto.presentacion = '';
    this.producto.color = '';
    this.producto.peso = 0;
    this.producto.catABC = '';
    this.producto.concatCodNombre = '';
    this.producto.concatCodErpNombre = '';
    this.producto.destacado = true;
    this.producto.activo = true;
    this.producto.cantidadMax = 0;
    this.producto.cantidadMin = 0;
    this.producto.categoriaProducto = null;
    this.producto.empresa = null;
    this.producto.inventariable = true;
    this.producto.iva = 0;
    this.producto.ivaEspecial = false;
    this.producto.obs = '';
    this.producto.unidad = null;
    this.producto.sinDescuento = true;
    this.producto.img = '';
    this.producto.grpMaterial = '';
  }

  ngOnInit() {
    this.user = this._loginService.user;
    this.cargarEmpresa();
    this.cargarCategoria();
    this.cargarUnidadMedida();
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._productoService.getProducto(id).subscribe((producto) => {
          this.producto = producto;
          this.producto.activo = producto.activo;
          this.producto.sinDescuento = producto.sinDescuento;
          this.producto.ivaEspecial = producto.ivaEspecial;
          this.seleccionCategoria = this.producto.categoriaProducto.codCategoriaProducto;
          this.seleccionUnidad = this.producto.unidad.codUnidad;


        });
      }
    });
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
    if (!this.producto.unidad) {
      this.invalido('Unidad de medida no puede ser nulo');
      return;
    }
    if (!this.producto.categoriaProducto) {
      this.invalido('categoria producto  no puede ser nulo');
      return;
    }
    if (!this.producto.catABC) {
      this.invalido('categoria abc no puede ser nulo');
      return;
    }
    if (this.producto.cantidadMin > this.producto.cantidadMax) {
      this.invalido('cantidad minima no puede ser mayor a cantidad maxima');
      return;
    }
    this.producto.empresa = this.empresa;
    console.log(this.producto);
    this._productoService.create(this.producto)
      .subscribe(
        (producto: Producto) => {
          if (this.imagenSubir) {
            this._productoService.uploadImage(this.imagenSubir, producto.codProducto).subscribe((pro: Producto) => {
              this.producto = pro;
              this.imagenTemp = null;
              $('#uploadedfile').val(null);
            });
          }
          this.router.navigate(['/productos']);
          this.router.navigate(['/productos']);
          swal.fire('Nuevo Producto', `El producto ${this.producto.nombreProducto} ha sido creado con éxito`, 'success');
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
    if (!this.producto.unidad) {
      this.invalido('Unidad de medida no puede ser nulo');
      return;
    }
    if (!this.producto.categoriaProducto) {
      this.invalido('categoria producto  no puede ser nulo');
      return;
    }
    if (!this.producto.catABC) {
      this.invalido('categoria abc no puede ser nulo');
      return;
    }
    if (this.producto.cantidadMin > this.producto.cantidadMax) {
      this.invalido('cantidad minima no puede ser mayor a cantidad maxima');
      return;
    }
    this._productoService.updateProducto(this.producto)
      .subscribe(
        (json: Producto) => {
          this.router.navigate(['/productos']);
          this.router.navigate(['/productos']);
          //  console.log("json: " + json.producto);
          if (this.imagenSubir) {
            this.cambiarImagen(this.producto.codProducto);
          }
          swal.fire('Producto Actualizado', `producto  : ${json.nombreProducto}`, 'success');
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

  cargarEmpresa() {
    this._empresaServicies.getempresa(this.user.codEmpresa).subscribe(empresa => {
      this.empresa = empresa;
      this.producto.empresa = this.empresa;
    });
  }

  cargarUnidadMedida() {
    this._unidadMedidaServices.traerUnidadMedida(this.user.codEmpresa).subscribe(unidadMedida => {
      this.unidadMedida = unidadMedida;
    });
  }

  cargarCategoria() {
    this._categoriaServices.traerCategoria(this.user.codEmpresa).subscribe(categoriaProducto => {
      this.categoriaProducto = categoriaProducto;
    });
  }

  cambioCategoria(event) {
    for (let indice = 0; indice < this.categoriaProducto.length; indice++) {
      if (this.categoriaProducto[indice].codCategoriaProducto == this.seleccionCategoria) {
        this.producto.categoriaProducto = this.categoriaProducto[indice];
      }
    }
  }

  seleccionarUnidadMedida(item) {
        this.producto.unidad = item;
  }
  cleanUnidad() {
    this.producto.unidad = null;
  }
  seleccionarCategoria(item) {
        this.producto.categoriaProducto = item;
  }

  cleanCategoria() {
    this.producto.categoriaProducto = null;
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
  }


  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

  cambiarImagen(cod) {
    this._productoService.uploadImage(this.imagenSubir, cod).subscribe((producto: Producto) => {
      this.producto = producto;
      this.imagenTemp = null;
      $('#uploadedfile').val(null);
    });
  }

}
