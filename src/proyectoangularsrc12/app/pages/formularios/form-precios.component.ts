import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, MedioPagoService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { MedioPago } from '../../models/medioPago.model';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { User } from '../../models/user.model';
import { Sucursal } from '../../models/sucursal.model';
import { Producto } from '../../models/producto.model';
import { Precio } from '../../models/precio.model';
import { PrecioService } from '../../services/precio/precio.service';
import { UnidadMedidaService } from '../../services/unidadMedida/unidadMedida.service';
import { ListaPrecioService } from '../../services/ListaPrecio/listaPrecio.service';
import { TipoPrecioService } from '../../services/TipoPrecio/tipoPrecio.service';
import { TipoPrecio } from '../../models/tipoPrecio.model';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { UnidadMedida } from '../../models/unidadMedida.model';

@Component({
  selector: 'app-form-precios',
  templateUrl: './form-precios.component.html',
  styles: []
})
export class FormPreciosComponent implements OnInit {
  precio: Precio = new Precio();
  cliente: Cliente;
  unidadMedida: UnidadMedida[] = [];
  producto: Producto;
  nombreProducto: string;
  nombreCliente: string;
  tipoPrecio: TipoPrecio[] = [];
  cargadorProducto: Producto;
  cargadorCliente: Cliente;
  medioPago: MedioPago[] = [];
  listaPrecio: ListaPrecio[] = [];
  sucursales: Sucursal[] = [];
  seleccionListaPrecio: number;
  seleccionUnidad: number;
  seleccionTipoPrecio: number;
  seleccionSucursal: number;
  user: User;

  seleccionMedioPago: number;
  titulo: string = 'Crear Precio';
  errores: ErrModel[];
  tipoDoc: any[] = [
    { id: 1, descripcion: 'RUC' },
    { id: 2, descripcion: 'CI' }
  ];

  constructor(private _clienteService: ClienteService,
    private _listaPrecioServices: ListaPrecioService,
    private toastr: ToastrService,
    private _precioService: PrecioService,
    private _tipoPrecioService: TipoPrecioService,
    private _loginService: LoginService,
    private _unidadService: UnidadMedidaService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.precio.codPrecio = null;
    this.precio.codPrecioErp = null;
    this.precio.codEmpresa = this._loginService.user.codEmpresa;
    this.precio.tipoPrecio = null;
    this.precio.producto = null;
    this.precio.unidadMedida = null;
    this.precio.cliente = null;
    this.precio.listaPrecio = null;
    this.precio.fechaDesde = null;
    this.precio.fechaHasta = null;
    this.precio.cantDesde = null;
    this.precio.cantHasta = null;
    this.precio.precio = null;
    this.precio.activo = null;
  }

  ngOnInit() {
    this.user = this._loginService.user;
    this.cargarTipoPrecio();
    this.cargarlistaPrecio();
    this.cargarUnidadMedida();

    if (!this.precio.activo) {
      this.precio.activo = true;
    }
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._precioService.getPrecio(id).subscribe((precio) => {
          this.precio = precio;
          if (precio.producto) {
            this.cargadorProducto = precio.producto;
          } else {
            $('#typeahead-productos').val('');
          }
          if (precio.cliente) {
            this.cargadorCliente = precio.cliente;

          } else {
            $('#typeahead-clientes').val('');
          }
        /*


          if (precio.unidadMedida) {
              this.precio.unidadMedida = precio.unidadMedida;
          } else {
            this.seleccionUnidad = null;
          }
          if (precio.tipoPrecio) {
             this.seleccionTipoPrecio = precio.tipoPrecio.codTipoPrecio;
          } else {
            this.seleccionTipoPrecio = null;
          }

          if (precio.listaPrecio) {
            $('#selectListaPrecio').val(precio.listaPrecio.codListaPrecio);
             this.seleccionListaPrecio = precio.listaPrecio.codListaPrecio;
          } else {
            this.seleccionListaPrecio = null;
          }
*/
          console.log('id : ' + id);
          /*   if (id === 0) {

            } else {


            } */
        });
      }
    });
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 2500 });
  }

  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }

  create(): void {

    if (!this.precio.unidadMedida) {
      this.invalido('Unidad de medida no puede ser nulo');
      return;
    }
    if (!this.precio.tipoPrecio) {
      this.invalido('Tipo Precio  no puede ser nulo');
      return;
    }
    if (!this.precio.listaPrecio) {
      this.invalido('Lista Precio no puede ser nulo');
      return;
    }
    if (this.precio.activo == null) {
      this.invalido('Activo no puede ser nulo');
      return;
    }
    this.precio.codEmpresa = this.user.codEmpresa;
    console.log(this.precio);
    this._precioService.createPrecio(this.precio)
      .subscribe(
        cliente => {
          this.router.navigate(['/precios']);
          swal.fire('Nuevo Precio', `El precio  ha sido creado con éxito`, 'success');
        },
        err => {
          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
          this.errores = err.error.errors;
          console.error('Código del error desde el backend: ' + err.status);

        }
      );
  }

  update(): void {

    if (!this.precio.unidadMedida) {
      this.invalido('Unidad de medida no puede ser nulo');
      return;
    }
    if (!this.precio.tipoPrecio) {
      this.invalido('Tipo Precio  no puede ser nulo');
      return;
    }
    if (!this.precio.listaPrecio) {
      this.invalido('Lista Precio no puede ser nulo');
      return;
    }
    if (this.precio.activo == null) {
      this.invalido('Activo no puede ser nulo');
      return;
    }
    this._precioService.updatePrecio(this.precio)
      .subscribe(
        json => {
          this.router.navigate(['/precios']);

          swal.fire('Precio Actualizado', `El precio fue actualizado con exito`, 'success');
        },
        err => {

          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
          this.errores = err.error.errors;
          console.error('Código del error desde el backend: ' + err.status);
        }
      );
  }

  /**********************************************CARGADORES************************************************************** */
  cargarlistaPrecio() {
    this._listaPrecioServices.traerListaPrecio(this.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.listaPrecio = resp;
    });
  }
  cargarTipoPrecio() {
    this._tipoPrecioService.traerTipoPrecio(this.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.tipoPrecio = resp;
    });
  }

  cargarUnidadMedida() {
    this._unidadService.traerUnidadMedida(this.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.unidadMedida = resp;
    });
  }


  /*************************************************************************************************************/
  cambioListaPrecio(event) {
        this.precio.listaPrecio = event;
  }
  cleanLista() {
    this.precio.listaPrecio = null;
}

  cambioTipoPrecio(event) {
        this.precio.tipoPrecio = event;
  }
  cleanTipoPrecio() {
    this.precio.tipoPrecio = null;
}
cleanUnidad() {
  this.precio.unidadMedida = null;
}

  cambioUnidad(event) {
        this.precio.unidadMedida =event;
       }
  seleccionarCliente(item: Cliente) {
    if (item) {
      this.cliente = item;
      this.cargadorCliente = item;
      this.precio.cliente = item;
      console.log(item.codCliente);
    } else {
      this.cliente = null;
      this.cargadorCliente = null;
      this.precio.cliente = null;
    }
  }

  seleccionarProducto(item: Producto) {
    if (item) {
      console.log(item);
      this.cargadorProducto = item;
      this.precio.producto = item;
    } else {
      this.producto = null;
      this.precio.producto = null;
    }



  }
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }


}
