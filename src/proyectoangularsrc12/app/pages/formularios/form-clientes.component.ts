import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, GrupoDescuentoService, MedioPagoService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';

import { MedioPago } from '../../models/medioPago.model';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { ListaPrecioService } from '../../services/ListaPrecio/listaPrecio.service';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { User } from '../../models/user.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { Sucursal } from '../../models/sucursal.model';
import * as moment from 'moment';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { FormaVenta } from '../../models/formaVenta.model';
import { FormaVentaService } from '../../services/formaVenta/formaVenta.service';
import { GrupoDescuento } from '../../models/grupoDescuento.model';
import { ClienteGoogle } from 'src/app/models/clienteGoogle.model';
import { event } from 'jquery';

@Component({
  selector: 'app-form-clientes',
  templateUrl: './form-clientes.component.html',
  styles: [`
  agm-map {
    height: 400px;
  }`]
})
export class FormClientesComponent implements OnInit {
  lat = -25.29688941637652;
  lng = -57.59492960130746;
  modalGoogle: string = 'oculto';
  cliente: Cliente = new Cliente();
  clienteGoogle: ClienteGoogle = new ClienteGoogle();
  formaVenta: FormaVenta[] = [];
  medioPago: MedioPago[] = [];
  listaPrecio: ListaPrecio[] = [];
  sucursales: Sucursal[] = [];
  grupos: GrupoDescuento[] = [];
  seleccionListaPrecio: number;
  seleccionSucursal: number;
  user: User;
  seleccionMedioPago: number;
  seleccionFormaVenta: number;
  errores: ErrModel[] = [];
  errors: ErrModel;
  cargadorClienteGoogle : ClienteGoogle = null;
  previous: any;
  linkBase = 'http://www.google.com/maps/place/';
  zoomMap: number = 14;
  mostrarMapa : boolean = false;
  modalUrlGoogle: string = 'oculto';
  urlGoogle: string = '';
mostrarDoc = false

  constructor(private _clienteService: ClienteService,
    private _medioPagoServices: MedioPagoService,
    private _formaVentaServices: FormaVentaService,
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _sucursalesServices: SucursalesService,
    private _ListaPrecioServices: ListaPrecioService,
    private _grupoDescuentoServices: GrupoDescuentoService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
      this.user = this._loginService.user;
    this.cliente.codEmpresa = this._loginService.user.codEmpresa;

    this.cliente.codClienteErp = '';
    this.cliente.categoria = null;
    this.cliente.grupo = null;
    this.cliente.latitud = this.lat;
    this.cliente.longitud = this.lng;
    this.cliente.medioPagoPref = null;
    this.cliente.listaPrecio = null;
    this.cliente.formaVentaPref = null;
    this.cliente.fechaCreacion = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    this.cliente.codUltimaVenta = null;
    this.cliente.zona = null;
    this.cliente.direccion = null;
    this.cliente.telefono = null;
    this.cliente.email = '';
    this.cliente.web = null;
    this.cliente.catABC = '';
    this.cliente.obs = null;
    this.cliente.excentoIva = false;
    this.cliente.activo = true;
    this.cliente.codeBarra = false;
    this.cliente.predeterminado = false;
    this.cliente.esPropietario = false;
    this.cliente.empleado = null;
    this.cliente.diasCredito = 0;
    this.cliente.grupoDescuento = null;
    this.cliente.carnetGrupo = '';
    this.cliente.carnetVencimiento = moment(new Date()).format('YYYY-MM-DD');
  }

  ngOnInit() {
    this.mostrarDoc= false;
    this.user = this._loginService.user;
    this._sucursalesServices.traerSucursales(this._loginService.user.codEmpresa).subscribe(sucursales => {
      this.sucursales = sucursales;
      this._ListaPrecioServices.traerListaPrecio(this._loginService.user.codEmpresa).subscribe(listaPrecio => {
        this.listaPrecio = listaPrecio;
        this._medioPagoServices.traerMedioPago(this._loginService.user.codEmpresa).subscribe(medioPago => {
          console.log(medioPago);
          this.medioPago = medioPago;
          this._formaVentaServices.traerFormaVenta(this._loginService.user.codEmpresa).subscribe(formaVenta => {
            this.formaVenta = formaVenta;
            this._grupoDescuentoServices.getByEmpresa(this._loginService.user.codEmpresa).subscribe(async grupos => {
              this.grupos = grupos;
              if (!this.cliente.tipoDoc) {
                this.cliente.tipoDoc = 'RUC';
              }
              if (!this.cliente.catABC) {
                this.cliente.catABC = 'C';
              }
              if (this.cliente.activo == null) {
                this.cliente.activo = true;
              }
              if (this.cliente.predeterminado == null) {
                this.cliente.predeterminado = false;
              }
              if (this.cliente.esPropietario == null) {
                this.cliente.esPropietario = false;
              }
              if (this.cliente.empleado == null) {
                this.cliente.empleado = false;
              }
              if (this.cliente.excentoIva == null) {
                this.cliente.excentoIva = false;
              }
              if (!this.cliente.medioPagoPref) {
                this.cliente.medioPagoPref = this.medioPago[0];
              }
              this.cliente.activo = true;
              this.cliente.catABC = 'B';
              if (!this.cliente.formaVentaPref) {
                let formaContado: FormaVenta[] = this.formaVenta.filter(forma => forma.esContado == true);
                this.cliente.formaVentaPref = formaContado[0];
              }
              if (!this.cliente.listaPrecio) {
                if(this.user.username.toUpperCase().includes('EXTERNO')) {
                  let institucional = this.listaPrecio.filter(lp => lp.descripcion.toUpperCase().includes('INSTITUCIONAL'));
                  this.cliente.listaPrecio = institucional[0];
                  console.log('Lista precio externo', this.cliente.listaPrecio);
                } else {
                  let showroom = await this.findListaPrecio(1);
                  this.cliente.listaPrecio = showroom;
                }
              }
              if (!this.cliente.sucursalPref) {
                this.cliente.sucursalPref = await this.findSucursal();
              }
              if (!this.cliente.grupoDescuento) {
                let grupAux: GrupoDescuento[] = this.grupos.filter(grupo => grupo.descuento == 0);
                this.cliente.grupoDescuento = grupAux[0];
              }
              this.activatedRoute.paramMap.subscribe(params => {
                let id = +params.get('id');
                if (id) {

                  this._clienteService.getCliente(id).subscribe((cliente) => {
                    this.cliente = cliente;
                    console.log('listo')

                      console.log(this.cliente);
                      this.lat = this.cliente.latitud;
                      this.lng = this.cliente.longitud;
                        this.mostrarDoc=true;
                  });
                }else{
                  this.mostrarDoc=true;
                }
              });
            });
          });
        });
      });
    });

  }

setNroDoc(event :string){
  console.log(event)
  this.cliente.docNro=event;
}


  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 1500 });
  }
  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }

  cerrarModal() {
    this.modalGoogle = 'oculto';
  }

  abrirModalAnalizarUrl() {
    this.modalUrlGoogle = '';
  }

  cerrarModalUrl() {
    this.modalUrlGoogle = 'oculto';
  }

  analizarUrl() {
    const url = this.urlGoogle;
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const matches = url.match(regex);

    if (matches && matches.length === 3) {
      const lat = parseFloat(matches[1]);
      const lng = parseFloat(matches[2]);
      this.cliente.latitud = lat;
      this.cliente.longitud = lng;
      this.cerrarModalUrl();
      this.toastr.success('Coordenadas actualizadas', 'Éxito', { timeOut: 1500 });
    } else {
      this._clienteService.getHtmlFromUrl(url).subscribe(html => {
        const newRegex = /center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/;
        const newMatches = html.match(newRegex);
        if (newMatches && newMatches.length === 3) {
          const lat = parseFloat(newMatches[1]);
          const lng = parseFloat(newMatches[2]);
          this.cliente.latitud = lat;
          this.cliente.longitud = lng;
          this.cerrarModalUrl();
          this.toastr.success('Coordenadas actualizadas', 'Éxito', { timeOut: 1500 });
        } else {
          this.toastr.error('No se encontraron coordenadas en la URL', 'Error', { timeOut: 1500 });
        }
      });
    }
  }
 abrirModal() {
    this.initClienteGoogle();
    this.modalGoogle = '';
    this.mostrarMapa = false;
  }

  confirmarCliente() {
    if ( this.cargadorClienteGoogle && this.cargadorClienteGoogle.latitud && this.cargadorClienteGoogle.longitud ) {
      this.cliente.latitud = this.clienteGoogle.latitud;
      this.cliente.longitud = this.clienteGoogle.longitud;
      this.cerrarModal();
    }
  }

  seleccionarClienteGoogle(event) {
    this.mostrarMapa = false;
    if ( event ) {
      this.cargadorClienteGoogle = event;
      this.clienteGoogle.name = this.cargadorClienteGoogle.name;
      this.clienteGoogle.address = this.cargadorClienteGoogle.address;
      this.clienteGoogle.latitud = this.cargadorClienteGoogle.latitud;
      this.clienteGoogle.longitud = this.cargadorClienteGoogle.longitud;
      console.log('CLIENTE GOOGLE',this.clienteGoogle);
      this.mostrarMapa = true;
    } else {
      this.cargadorClienteGoogle = null;
    }

  }

  initClienteGoogle() {
    this.clienteGoogle.name = 'indefinido';
    this.clienteGoogle.address = 'indefinido';
    this.clienteGoogle.latitud = this.lat;
    this.clienteGoogle.longitud = this.lng;

    this.cargadorClienteGoogle = null;
  }


  clickedMarker(infowindow) {
    console.log(infowindow);
    if (this.previous) {
      this.previous.close();
    }
    this.previous = infowindow;
  }
  openLink() {
    let newLink = this.linkBase + this.cliente.latitud + ',' + this.cliente.longitud;
    window.open(newLink, '_blank');
  }


  create(): void {
    if (!this.cliente.formaVentaPref) {
      this.invalido('forma venta no puede ser nulo');
      return;
    }
    if (!this.cliente.sucursalPref) {
      this.invalido('sucursal no puede ser nulo');
      return;
    }
    if (this.cliente.activo == null) {
      this.cliente.activo = true;
    }
    if (this.cliente.empleado == null) {
      this.invalido('Empleado no puede ser nulo');
      return;
    }
    if (this.cliente.predeterminado == null) {
      this.invalido('predeterminado no puede ser nulo');
      return;
    }
    if (!this.cliente.listaPrecio) {
      this.invalido('Lista precio no puede ser nulo');
      return;
    }
    if (this.cliente.excentoIva == null) {
      this.invalido('excentoIva no puede ser nulo');
      return;
    }
    if (!this.cliente.medioPagoPref) {
      this.invalido('mediopago no puede ser nulo');
      return;
    }
    if (!this.cliente.tipoDoc) {
      this.invalido('tipo de documento no puede ser nulo');
      return;
    }
    if (this.cliente.grupoDescuento) {
      if (this.cliente.grupoDescuento.descuento > 0 && this.cliente.carnetGrupo.length < 5) {
        this.invalido('Verificar Nro carnet no debe ser' + this.cliente.carnetGrupo);
        return;
      }
    }
    if (!this.cliente.grupoDescuento) {
      let grupAux: GrupoDescuento[] = this.grupos.filter(grupo => grupo.descuento == 0);
      this.cliente.grupoDescuento = grupAux[0];
    }
    this._clienteService.create(this.cliente)
      .subscribe(
        cliente => {
          this.router.navigate(['/clientes']);
          swal.fire('Nuevo cliente', `El cliente ${this.cliente.razonSocial} ha sido creado con éxito`, 'success');
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
    console.log(this.cliente);
    if (!this.cliente.formaVentaPref) {
      this.invalido('forma venta no puede ser nulo');
      return;
    }
    if (!this.cliente.sucursalPref) {
      this.invalido('sucursal no puede ser nulo');
      return;
    }
    if (this.cliente.activo == null) {
      this.cliente.activo = true;
    }
    if (!this.cliente.listaPrecio) {
      this.invalido('Lista precio no puede ser nulo');
      return;
    }
    if (this.cliente.excentoIva == null) {
      this.invalido('excentoIva no puede ser nulo');
      return;
    }
    if (!this.cliente.medioPagoPref) {
      this.invalido('mediopago no puede ser nulo');
      return;
    }
    if (!this.cliente.tipoDoc) {
      this.invalido('tipo de documento no puede ser nulo');
      return;
    }
    if (this.cliente.grupoDescuento) {
      if (this.cliente.grupoDescuento.descuento > 0 && this.cliente.carnetGrupo.length < 5) {
        this.invalido('Verificar Nro carnet no debe ser' + this.cliente.carnetGrupo);
        return;
      }
    }
    if (!this.cliente.grupoDescuento) {
      let grupAux: GrupoDescuento[] = this.grupos.filter(grupo => grupo.descuento == 0);
      this.cliente.grupoDescuento = grupAux[0];
    }
    this._clienteService.update(this.cliente)
      .subscribe(
        (cliente: Cliente) => {
          this.router.navigate(['/clientes']);
          swal.fire('Cliente Actualizado', `cliente  : ${cliente.razonSocial}`, 'success');
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
  findListaPrecio(cod) {
    let response = this._ListaPrecioServices.getById(cod).toPromise();
    return response;
  }
  findSucursal() {
    let response = this._sucursalesServices.getSucursalbyId(this._loginService.user.codSucursal).toPromise();
    return response;
  }

  cargarForma(cod) {
    this._formaVentaServices.traerFormaVenta(cod).subscribe(resp => {
      console.log(resp);
      this.formaVenta = resp;
    });
  }
  cambioMedioPago(event) {
    this.cliente.medioPagoPref = event;
  }
  cambioListaPrecio(event) {
    this.cliente.listaPrecio = event;
  }
  cambioGrupo(evento) {
    this.cliente.grupoDescuento = evento;
  }

  cleanLista() {
    this.cliente.listaPrecio = null;
  }
  cleanGrupo() {
    this.cliente.grupoDescuento = null;
  }


  cleanMedio() {
    this.cliente.medioPagoPref = null;
  }
  cleanForma() {
    this.cliente.formaVentaPref = null;
  }
  cambioForma(evento) {
    this.cliente.formaVentaPref = evento;

  }

  cambioSucursal(event) {
    this.cliente.sucursalPref = event;
  }
  cleanSucursal() {
    this.cliente.sucursalPref = null;
  }

  cargarmedioPago(cod) {
    this._medioPagoServices.traerMedioPago(cod).subscribe(resp => {
      console.log('medio pago', resp);
      this.medioPago = resp;
    });
  }

  agregarMarcador(evento) {
    console.log(evento);
    const coords: { lat: number, lng: number } = evento.coords;
    this.cliente.latitud = coords.lat;
    this.cliente.longitud = coords.lng;
  }


  limpiarCadena(evento: string) {
    if (this.cliente.tipoDoc == 'CE') {
      return evento.replace(/[^A-Z0-9-]/g, '');
    } else {
      return evento.replace(/[^A-Z0-9]/g, '');
    }
  }


  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }



}
