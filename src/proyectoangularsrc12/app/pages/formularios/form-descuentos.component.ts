import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, MedioPagoService, ListaPrecioService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { MedioPago } from '../../models/medioPago.model';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { User } from '../../models/user.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { Sucursal } from '../../models/sucursal.model';
import { Descuento } from '../../models/descuento.model';
import { DescuentoService } from '../../services/descuento/descuento.service';
import { Producto } from '../../models/producto.model';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';


@Component({
  selector: 'app-form-descuentos',
  templateUrl: './form-descuentos.component.html',
  styles: []
})
export class FormDescuentosComponent implements OnInit {
  descuento: Descuento = new Descuento();
  cliente: Cliente;
  producto: Producto;
  nombreProducto: string;
  nombreCliente: string;
  cargadorProducto: Producto;
  cargadorCliente: Cliente;
  medioPago: MedioPago[] = [];
  listaPrecio: ListaPrecio[] = [];
  sucursales: Sucursal[] = [];
  seleccionListaPrecio: number;
  seleccionSucursal: Sucursal;
  user: User;

  seleccionMedioPago: number;
  titulo: string = 'Crear Descuento';
  errores: ErrModel[] = [];
  tipoDoc: any[] = [
    { id: 1, descripcion: 'RUC' },
    { id: 2, descripcion: 'CI' }
  ];

  constructor(private _clienteService: ClienteService,
    private toastr: ToastrService,
    private _medioPagoServices: MedioPagoService,
    private _listaPrecioServices: ListaPrecioService,
    private _loginService: LoginService,
    private _sucursalesServices: SucursalesService,
    private _descuentoService: DescuentoService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.descuento.descripcion = '';
    this.descuento.codDescuentoErp = '';
    this.descuento.codEmpresa = this._loginService.user.codEmpresa;
    this.descuento.tipoDescuento = '';
    this.descuento.unidadDescuento = '';
    this.descuento.fechaDesde = null;
    this.descuento.fechaHasta = null;
    this.descuento.producto = null;
    this.descuento.cliente = null;
    this.descuento.listaPrecio = null;
    this.descuento.medioPago = null;
    this.descuento.descuento = 0;
    this.descuento.cantDesde = 1;
    this.descuento.cantHasta = 1;
    this.descuento.activo = true;
  }

  ngOnInit() {
    this.user = this._loginService.user;
    this.cargarSucursales();
    this.cargarlistaPrecio();
    this.cargarmedioPago();

    if (!this.descuento.activo) {
      this.descuento.activo = true;
    }
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._descuentoService.getDescuentoById(id).subscribe(async (descuento) => {
          this.descuento = descuento;

          if (descuento.tipoDescuento === 'PRODUCTO' || descuento.tipoDescuento === 'UNO_DE_DOS') {
            this.cargadorProducto = descuento.producto;
            this.nombreProducto = descuento.producto.nombreProducto;
            console.log(this.nombreProducto);
          } else {
            $('#typeahead-productos').val('');
            this.nombreProducto = null;
          }
          if (descuento.cliente) {
            this.cargadorCliente = descuento.cliente;
            this.nombreCliente = descuento.cliente.razonSocial;
          } else {
            $('#typeahead-clientes').val('');
            this.nombreCliente = '';
          }
          if (descuento.medioPago) {
            this.seleccionMedioPago = descuento.medioPago.codMedioPago;
          } else {
            this.seleccionMedioPago = null;
          }

          if (descuento.listaPrecio) {
            $('#selectListaPrecio').val(descuento.listaPrecio.codListaPrecio);
            this.seleccionListaPrecio = descuento.listaPrecio.codListaPrecio;
          } else {
            this.seleccionListaPrecio = null;
          }
          if (this.descuento.codSucursal) {
            this.seleccionSucursal = await this.findSucursal(this.descuento.codSucursal);
          }else{
            this.seleccionSucursal = null;
          }
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
    console.log(this.descuento);
    if (this.descuento.tipoDescuento) {
      if ((this.descuento.tipoDescuento === 'PRODUCTO' || this.descuento.tipoDescuento === 'UNO_DE_DOS') && !this.descuento.producto) {
        this.invalido('Producto no puede ser nulo en este tipo de descuento');
        return;
      }
      if (this.descuento.tipoDescuento === 'CLIENTE' && !this.descuento.cliente) {
        this.invalido('Cliente no puede ser nulo en este tipo de descuento');
        return;
      }
      if (this.descuento.tipoDescuento === 'IMPORTE' && (this.descuento.cantDesde === null || this.descuento.cantHasta === null)) {
        this.invalido('cantidadDesde o CantidadHasta no puede ser nulo en este tipo de descuento');
        return;
      }
      if (this.descuento.tipoDescuento === 'NORMAL' && this.descuento.descuento === null) {
        this.invalido('descuento no puede ser nulo en este tipo de descuento');
        return;
      }
      if (this.descuento.tipoDescuento === 'SUCURSAL' && this.descuento.codSucursal === null) {
        this.invalido('sucursal no puede ser nulo en este tipo de descuento');
        return;
      }
      if (this.descuento.tipoDescuento === 'MEDIO_PAGO' && this.descuento.codSucursal === null) {
        this.invalido('MEDIO PAGO no puede ser nulo en este tipo de descuento');
        return;
      }
    } else {
      this.invalido('TipoDescuento no puede ser nulo');
      return;
    }
    if (!this.descuento.descuento || this.descuento.descuento === 0) {
      this.invalido('descuento no puede ser nulo');
      return;
    }
    if (this.descuento.unidadDescuento === null || this.descuento.unidadDescuento === '') {
      this.invalido('unidadDescuento no puede ser nulo');
      return;
    }
    if (!this.descuento.fechaDesde) {
      this.invalido('fechaDesde no puede ser nulo');
      return;
    }
    if (!this.descuento.fechaHasta) {
      this.invalido('fechaHasta no puede ser nulo');
      return;
    }
    if (!this.descuento.listaPrecio) {
      this.invalido('Lista precio no puede ser nulo');
      return;
    }

    this.descuento.codEmpresa = this.user.codEmpresa;
    console.log(this.descuento);
    this._descuentoService.createDescuento(this.descuento)
      .subscribe(
        cliente => {
          this.router.navigate(['/descuentos']);
          swal.fire('Nuevo Descuento', `El descuento ${this.descuento.descripcion} ha sido creado con éxito`, 'success');
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
    console.log(this.descuento);
    if (this.descuento.tipoDescuento) {
      if ((this.descuento.tipoDescuento === 'PRODUCTO' || this.descuento.tipoDescuento === 'UNO_DE_DOS') && !this.descuento.producto) {
        this.invalido('Producto no puede ser nulo en este tipo de descuento');
        return;
      }
      if (this.descuento.tipoDescuento === 'CLIENTE' && !this.descuento.cliente) {
        this.invalido('Cliente no puede ser nulo en este tipo de descuento');
        return;
      }
      if (this.descuento.tipoDescuento === 'IMPORTE' && (this.descuento.cantDesde === null || this.descuento.cantHasta === null)) {
        this.invalido('cantidadDesde o CantidadHasta no puede ser nulo en este tipo de descuento');
        return;
      }
      if (this.descuento.tipoDescuento === 'NORMAL' && this.descuento.descuento === null) {
        this.invalido('descuento no puede ser nulo en este tipo de descuento');
        return;
      }
      if (this.descuento.tipoDescuento === 'SUCURSAL' && this.descuento.codSucursal === null) {
        this.invalido('sucursal no puede ser nulo en este tipo de descuento');
        return;
      }
      if (this.descuento.tipoDescuento === 'MEDIO_PAGO' && this.descuento.codSucursal === null) {
        this.invalido('MEDIO PAGO no puede ser nulo en este tipo de descuento');
        return;
      }
    } else {
      this.invalido('TipoDescuento no puede ser nulo');
      return;
    }
    if (!this.descuento.descuento || this.descuento.descuento === 0) {
      this.invalido('descuento no puede ser nulo');
      return;
    }
    if (this.descuento.unidadDescuento === null || this.descuento.unidadDescuento === '') {
      this.invalido('unidadDescuento no puede ser nulo');
      return;
    }
    if (!this.descuento.listaPrecio) {
      this.invalido('Lista precio no puede ser nulo');
      return;
    }
    if (!this.descuento.fechaDesde) {
      this.invalido('fechaDesde no puede ser nulo');
      return;
    }
    if (!this.descuento.fechaHasta) {
      this.invalido('fechaHasta no puede ser nulo');
      return;
    }
    this._descuentoService.updateDescuento(this.descuento)
      .subscribe(
        (json: Descuento) => {
          this.router.navigate(['/descuentos']);
          swal.fire('Descuento Actualizado', `Descuento  : ${json.descripcion}`, 'success');
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
 /* findListaPrecio(cod) {
    let response = this._ListaPrecioServices.getById(cod).toPromise();
    return response;
  }*/
  findSucursal(cod) {
    let response = this._sucursalesServices.getSucursalbyId(cod).toPromise();
    return response;
  }

  cargarmedioPago() {
    this._medioPagoServices.traerMedioPago(this.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.medioPago = resp;
    });
  }

  cargarSucursales() {
    this._sucursalesServices.traerSucursales(this.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.sucursales = resp;
    });
  }

  cargarlistaPrecio() {
    this._listaPrecioServices.traerListaPrecio(this.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.listaPrecio = resp;
    });
  }


  cambioMedioPago(event) {
    for (let indice = 0; indice < this.medioPago.length; indice++) {
      // tslint:disable-next-line:triple-equals
      if (this.medioPago[indice].codMedioPago == this.seleccionMedioPago) {
        this.cliente.medioPagoPref = this.medioPago[indice];
      }
    }
  }
  cambioListaPrecio(evento) {
     this.descuento.listaPrecio =evento;
   }

  cambioSucursal(sucursal:Sucursal) {
    if (sucursal) {
      this.seleccionSucursal = sucursal;
      this.descuento.codSucursal = sucursal.codSucursal;
    }
  }

  cambioTipoDescuento(event) {
    let tipo = event;
    // tslint:disable-next-line:triple-equals
    if (tipo == 'CLIENTE') {
      this.descuento.producto = null;
      this.cargadorProducto = null;
      this.seleccionMedioPago = null;
      this.descuento.medioPago = null;
      // this.descuento.descuento = null;

    }
    // tslint:disable-next-line:triple-equals
    if (tipo == 'PRODUCTO'|| tipo == 'UNO_DE_DOS') {
      this.cargadorCliente = null;
      this.descuento.cliente = null;
      this.seleccionMedioPago = null;
      this.descuento.medioPago = null;
      this.descuento.descuento = null;

    }  // tslint:disable-next-line:triple-equals
    if (tipo == 'SUCURSAL') {
      this.cargadorProducto = null;
      this.descuento.producto = null;
      this.cargadorCliente = null;
      this.descuento.cliente = null;
      this.seleccionMedioPago = null;
      this.descuento.medioPago = null;
      this.descuento.descuento = null;

    }  // tslint:disable-next-line:triple-equals
    if (tipo == 'IMPORTE') {
      this.cargadorProducto = null;
      this.descuento.producto = null;
      this.cargadorCliente = null;
      this.descuento.cliente = null;
      this.seleccionMedioPago = null;
      this.descuento.medioPago = null;
      this.descuento.descuento = null;

    }  // tslint:disable-next-line:triple-equals
    if (tipo == 'MEDIO_PAGO') {
      this.cargadorProducto = null;
      this.descuento.producto = null;
      this.cargadorCliente = null;
      this.descuento.cliente = null;
      this.descuento.descuento = null;

    }  // tslint:disable-next-line:triple-equals
    if (tipo == 'NORMAL') {
      this.cargadorProducto = null;
      this.descuento.producto = null;
      this.cargadorCliente = null;
      this.descuento.cliente = null;
      this.seleccionMedioPago = null;
      this.descuento.medioPago = null;
      this.descuento.descuento = null;

    }

  }

  seleccionarMedioPago(item) {
    for (let indice = 0; indice < this.medioPago.length; indice++) {  // tslint:disable-next-line:triple-equals
      if (this.medioPago[indice].codMedioPago == item) {
        this.descuento.medioPago = this.medioPago[indice];
      }
    }
    this.seleccionMedioPago = item;
  }
  seleccionarCliente(item: Cliente) {
    this.cliente = item;
    this.cargadorCliente = item;
    this.descuento.cliente = item;
    console.log(item.codCliente);
  }



  cleanLista() {
    this.descuento.listaPrecio = null;
  }
  cleanSucursal() {
     
      this.descuento.codSucursal = null;
      this.seleccionSucursal = null;
  }
  seleccionarProducto(item: Producto) {
    console.log(item);
    this.cargadorProducto = item;
    this.descuento.producto = item;
  }

  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }


}
