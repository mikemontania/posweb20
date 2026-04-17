import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, MedioPagoService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { MedioPago } from '../../models/medioPago.model';
import { ListaPrecio } from '../../models/listaPrecio.model';
 
import { User } from '../../models/user.model';
import { ToastrService } from 'ngx-toastr';
 import { Producto } from '../../models/producto.model';
import { Comprobantes } from '../../models/comprobantes.model';
import { ComprobantesService } from '../../services/comprobantes/comprobantes.service';
import { Terminales } from '../../models/terminales.model';
import { TerminalService } from '../../services/terminales/terminales.service';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { Sucursal } from '../../models/sucursal.model';
import { ErrModel } from '../../models/ErrModel.model';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'app-form-comprobantes',
  templateUrl: './form-comprobantes.component.html',
  styles: []
})
export class FormComprobantesComponent implements OnInit {
  comprobante: Comprobantes = new Comprobantes();
  cliente: Cliente;
  producto: Producto;
  nombreProducto: string;
  nombreCliente: string;
  cargadorProducto: Producto;
  cargadorCliente: Cliente;
  medioPago: MedioPago[] = [];
  listaPrecio: ListaPrecio[] = [];
  terminales: Terminales[] = [];
  sucursales: Sucursal[] = [];
  seleccionSucursal: number;
  seleccionTipos: string;
  seleccionTerminal: number;
  user: User;
  mask = [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/];
  titulo: string = 'Crear comprobante';
  errores:  ErrModel[] = [];
  tipos: any[] = [
    { value: 'FACTURA', descripcion: 'FACTURA' },
    { value: 'TICKET', descripcion: 'TICKET' }
  ];
  


  constructor(
    private toastr: ToastrService,
    private _loginService: LoginService,
    private _terminalesServices: TerminalService,
    private _sucursalesServices: SucursalesService,
    private _comprobanteService: ComprobantesService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
        this.comprobante.timbrado = '';
        this.comprobante.tipoComprobante = '';
        this.comprobante.tipoImpresion = '';
        this.comprobante.codEmpresa =  this._loginService.user.codEmpresa;
        this.comprobante.codNumeracion = null;
        this.comprobante.nroComprobante = null;
        this.comprobante.codSucursal = null;
        this.comprobante.inicioTimbrado = null;
        this.comprobante.finTimbrado = null;
        this.comprobante.numeroInicio = null;
        this.comprobante.maxItems = null;
        this.comprobante.numeroFin = null;
        this.comprobante.serie = '';
        this.comprobante.ultimoNumero = 0;
        this.comprobante.activo = false;
        this.comprobante.autoImpresor = false;

    }

    ngOnInit() {
    this.user = this._loginService.user;
    this.cargarSucursales();
    this.cargarTerminales();
          if (!this.comprobante.activo) {
            this.comprobante.activo = true;
          }
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._comprobanteService.getComprobanteById(id).subscribe((comprobante) => {
                this.comprobante = comprobante;
                console.log(this.comprobante);
                /****evitar que venga mas caracteres** */
                if (this.comprobante.serie) {
                  if (this.comprobante.serie.length > 7) {
                    this.comprobante.serie = null;
                  }
                }
                if (this.comprobante.terminal) {
                  this.seleccionTerminal = this.comprobante.terminal.codTerminalVenta;
                }
                if (this.comprobante.codSucursal) {
                  this.seleccionSucursal = this.comprobante.codSucursal;
                }
              });
            }
          });
  }
    create(): void {
      if (!this.comprobante.terminal) {
        this.invalido('Terminal no puede ser nulo');
        return;
      }
      if (!this.comprobante.tipoComprobante) {
        this.invalido('Tipo Comprobante no puede ser nulo');
        return;
      }
      if (!this.comprobante.codSucursal) {
        this.invalido('Sucursal no puede ser nulo');
        return;
      }
        this.comprobante.codEmpresa = this._loginService.user.codEmpresa;
        console.log(this.comprobante);
        this._comprobanteService.create(this.comprobante)
          .subscribe(
            obj => {
              this.router.navigate(['/comprobantes']);
              swal.fire('Nuevo comprobante', `El comprobante ${this.comprobante.serie} ha sido creado con éxito`, 'success');
              this.comprobante.terminal.disponible = true;
              this._terminalesServices.update(this.comprobante.terminal)
              .subscribe(
               ( json: Terminales) => {
                  console.log('ok');
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
    if (!this.comprobante.terminal) {
      this.invalido('Terminal no puede ser nulo');
      return;
    }
    if (!this.comprobante.tipoComprobante) {
      this.invalido('Tipo Comprobante no puede ser nulo');
      return;
    }
    if (!this.comprobante.codSucursal) {
      this.invalido('Sucursal no puede ser nulo');
      return;
    }
      this._comprobanteService.update(this.comprobante)
        .subscribe(
          json => {
            this.router.navigate(['/comprobantes']);
            swal.fire('Comprobante Actualizado', `comprobante  : ${json.serie}`, 'success');
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

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
    {timeOut: 1500});
  }
  error(err) {
    this.toastr.error(err, 'Error',
    {timeOut: 2500});
  }
    cargarTerminales() {
      let codSucursal;
      if (this._loginService.user.authorities[0] == 'ROLE_ADMIN') {
        codSucursal = 0;
      } else {
        codSucursal = this._loginService.user.codSucursal;
      }
      this._terminalesServices.traerterminales(this.user.codEmpresa, codSucursal).subscribe(resp => {
        console.log(resp);
          this.terminales = resp;
        });
      }

    cambioTerminal(event) {
      for (let indice = 0; indice < this.terminales.length; indice++) {
        if (this.terminales[indice].codTerminalVenta == this.seleccionTerminal) {
          this.comprobante.terminal = this.terminales[indice];
        }
      }
    }

    cargarSucursales() {
      this._sucursalesServices.traerSucursales(this.user.codEmpresa).subscribe(resp => {
        console.log(resp);
          this.sucursales = resp;
        });
      }

    cambioSucursal(event) {
      for (let indice = 0; indice < this.sucursales.length; indice++) {
        if (this.sucursales[indice].codSucursal == this.seleccionSucursal) {
          this.comprobante.codSucursal = this.sucursales[indice].codSucursal;
        }
      }
    }

    cambioTipo(event) {
      for (let indice = 0; indice < this.tipos.length; indice++) {
        if (this.tipos[indice].value == this.seleccionTipos) {
          this.comprobante.tipoComprobante = this.tipos[indice].value;
        }
      }
    }

}
