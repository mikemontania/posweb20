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
import { Punto } from '../../models/punto.model';
import { PuntoService } from '../../services/punto/punto.service';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service'; 
import { Producto } from 'src/app/models/producto.model';


@Component({
  selector: 'app-form-punto',
  templateUrl: './form-punto.component.html',
  styles: []
})
export class FormPuntosComponent implements OnInit {
  punto: Punto = new Punto();
  cliente: Cliente;
  producto: Producto; 
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
  titulo: string = 'Crear Punto';
  errores: ErrModel[] = [];
  tipoDoc: any[] = [
    { id: 1, descripcion: 'RUC' },
    { id: 2, descripcion: 'CI' }
  ];

  constructor(
    private toastr: ToastrService,
    private _listaPrecioServices: ListaPrecioService,
    private _loginService: LoginService,
    private _sucursalesServices: SucursalesService,
    private _puntoService: PuntoService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.punto.descripcion = '';
    this.punto.codEmpresa = this._loginService.user.codEmpresa;
    this.punto.tipo = '';
    this.punto.fechaDesde = null;
    this.punto.fechaHasta = null;
    this.punto.producto = null; 
    this.punto.listaPrecio = null; 
    this.punto.puntos = 0;
    this.punto.importeDesde = 1;
    this.punto.importeHasta = 1;
    this.punto.activo = true;
  }

  ngOnInit() {
    this.user = this._loginService.user;
    this.cargarSucursales();
    this.cargarlistaPrecio();

    if (!this.punto.activo) {
      this.punto.activo = true;
    }
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._puntoService.getPuntoById(id).subscribe(async (punto) => {
          this.punto = punto;

          if (punto.tipo === 'PRODUCTO' || punto.tipo === 'UNO_DE_DOS') {
            this.cargadorProducto = punto.producto;  
          } else {
            $('#typeahead-productos').val(''); 
          }

          if (punto.listaPrecio) {
            $('#selectListaPrecio').val(punto.listaPrecio.codListaPrecio);
            this.seleccionListaPrecio = punto.listaPrecio.codListaPrecio;
          } else {
            this.seleccionListaPrecio = null;
          }
          if (this.punto.codSucursal) {
            this.seleccionSucursal = await this.findSucursal(this.punto.codSucursal);
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
    console.log(this.punto);

    if (!this.punto.puntos || this.punto.puntos === 0) {
      this.invalido('punto no puede ser nulo');
      return;
    }
    if (!this.punto.fechaDesde) {
      this.invalido('fechaDesde no puede ser nulo');
      return;
    }
    if (!this.punto.fechaHasta) {
      this.invalido('fechaHasta no puede ser nulo');
      return;
    }
    if (!this.punto.listaPrecio) {
      this.invalido('Lista precio no puede ser nulo');
      return;
    }

    this.punto.codEmpresa = this.user.codEmpresa;
    console.log(this.punto);
    this._puntoService.createPunto(this.punto)
      .subscribe(
        cliente => {
          this.router.navigate(['/puntos']);
          swal.fire('Nuevo Punto', `El punto ${this.punto.descripcion} ha sido creado con éxito`, 'success');
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
    console.log(this.punto);
    if (!this.punto.puntos || this.punto.puntos === 0) {
      this.invalido('puntos no puede ser nulo');
      return;
    }
    if (!this.punto.listaPrecio) {
      this.invalido('Lista precio no puede ser nulo');
      return;
    }
    if (!this.punto.fechaDesde) {
      this.invalido('fechaDesde no puede ser nulo');
      return;
    }
    if (!this.punto.fechaHasta) {
      this.invalido('fechaHasta no puede ser nulo');
      return;
    }
    this._puntoService.updatePunto(this.punto)
      .subscribe(
        (json: Punto) => {
          this.router.navigate(['/puntos']);
          swal.fire('Punto Actualizado', `Punto  : ${json.descripcion}`, 'success');
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

  cambioListaPrecio(evento) {
     this.punto.listaPrecio =evento;
   }

  cambioSucursal(sucursal:Sucursal) {
    if (sucursal) {
      this.seleccionSucursal = sucursal;
      this.punto.codSucursal = sucursal.codSucursal;
    }
  }

  cleanLista() {
    this.punto.listaPrecio = null;
  }
  cleanSucursal() {
     
      this.punto.codSucursal = null;
      this.seleccionSucursal = null;
  }
  seleccionarProducto(item: Producto) {
    console.log(item);
    this.cargadorProducto = item;
    this.punto.producto = item;
  }

  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }


}
