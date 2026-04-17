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
import { Location } from '@angular/common';
import { GrupoDescuento } from '../../models/grupoDescuento.model';

@Component({
  selector: 'form-cliente',
  templateUrl: './form-cliente.component.html',
  styles: []
})
export class FormClienteComponent implements OnInit {
  lat = -25.29688941637652;
  lng = -57.59492960130746;
  urlGoogle: string = '';
  persona: Cliente = new Cliente();
  cliente: Cliente = new Cliente();
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
  deshabilitarBoton: boolean = false;
  mostrarDoc = false
  constructor(private _clienteService: ClienteService,
    private _location: Location,
    private _medioPagoServices: MedioPagoService,
    private _formaVentaServices: FormaVentaService,
    public _loginService: LoginService,
    private toastr: ToastrService,
    private _sucursalesServices: SucursalesService,
    private _ListaPrecioServices: ListaPrecioService,
    private _grupoDescuentoServices: GrupoDescuentoService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.persona.docNro = '';
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
    this.mostrarDoc=false;
    this.persona.docNro = '';
    this.user = this._loginService.user;
    this._sucursalesServices.traerSucursales(this._loginService.user.codEmpresa).subscribe(sucursales => {
      this.sucursales = sucursales;
      this._ListaPrecioServices.traerListaPrecio(this._loginService.user.codEmpresa).subscribe(listaPrecio => {
        this.listaPrecio = listaPrecio;
        this._medioPagoServices.traerMedioPago(this._loginService.user.codEmpresa).subscribe(medioPago => {
          console.log('************************',medioPago);
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
                this.cliente.medioPagoPref = this.medioPago.find(medio => medio.descripcion === 'EFECTIVO');
              }
              this.cliente.activo = true;
              this.cliente.catABC = 'B';
              if (!this.cliente.formaVentaPref) {
                let formaContado: FormaVenta[] = this.formaVenta.filter(forma => forma.esContado == true);
                this.cliente.formaVentaPref = formaContado[0];
              }
              if (!this.cliente.listaPrecio) {
                this.cliente.listaPrecio =  this.listaPrecio[0];
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

                      console.log(this.cliente);
                      this.lat = this.cliente.latitud;
                      this.lng = this.cliente.longitud;

                  }); this.mostrarDoc=true;
                }else{
                  this.mostrarDoc=true;
                }
                this.cliente.obs ='';
              });
            });
          });
        });
      });
    });
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
          this.toastr.success('Coordenadas actualizadas', 'Éxito', { timeOut: 1500 });
        } else {
          this.toastr.error('No se encontraron coordenadas en la URL', 'Error', { timeOut: 1500 });
        }
      });
    }
  }



  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 1500 });
  }
  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }
  setNroDoc(event :string){
    console.log(event)
    this.cliente.docNro=event;
  }

  create(): void {
    if (!this.cliente.razonSocial || this.cliente.razonSocial.length < 6) {
      this.invalido('Razon Social debe tener al menos 6 caracteres');
      return;
    }
    if (!this.cliente.docNro || this.cliente.docNro.length < 6) {
      this.invalido('docNro debe tener al menos 6 caracteres');
      return;
    }
    if (!this.cliente.telefono || this.cliente.telefono.length < 6) {
      this.invalido('telefono debe tener al menos 6 caracteres');
      return;
    }
    if (!this.cliente.direccion || this.cliente.direccion.length < 4) {
      this.invalido('direccion debe tener al menos 4 caracteres');
      return;
    }
    if (!this.cliente.formaVentaPref) {
      this.invalido('forma venta no puede ser nulo');
      return;
    }
    if (!this.cliente.sucursalPref) {
      this.invalido('sucursal no puede ser nulo');
      return;
    }
    if (this.cliente.activo == null) {
      this.invalido('Activo no puede ser nulo');
      return;
    }
    if (this.cliente.predeterminado == null) {
      this.invalido('predeterminado no puede ser nulo');
      return;
    }
    if (this.cliente.empleado == null) {
      this.invalido('empleado no puede ser nulo');
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

    this.deshabilitarBoton = true;

    this._clienteService.create(this.cliente)
      .subscribe(
        cliente => {
          this.deshabilitarBoton = false;
          this.atras();
          swal.fire('Nuevo cliente', `El cliente ${this.cliente.razonSocial} ha sido creado con éxito`, 'success');
        },
        err => {
          this.deshabilitarBoton = false;

          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
          this.errores = err.error.errors;
          console.error('Código del error desde el backend: ' + err.status);
        }
      );
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
  atras() {
    this._location.back();
  }


  async verificarDoc() {
    this.persona.docNro = await this.limpiarCadena(this.persona.docNro);
    console.log('VERIFICANDO...');
    if (this.persona.docNro) {
      switch (this.cliente.tipoDoc) {
        case 'RUC':
          let digito = this.calcular(this.persona.docNro);
          this.cliente.docNro = this.persona.docNro.concat('-', digito.toString());
          break;
        case 'CI':
          this.cliente.docNro = this.persona.docNro;
          break;
        case 'CE':
          this.cliente.docNro = this.persona.docNro;
          break;

        default:
          break;
      }
    }
  }


  calcular(numero: string) {
    console.log('CALCULANDO DIGITO');
    const BASEMAX = 11;
    let codigo: number;
    let numeroAl: string = '';
    let caracterHasta = 0;
    let k = 2;
    let total = 0;
    // Cambia la ultima letra por ascii en caso que la cedula termine en letra
    for (let index = 0; index < numero.length; index++) {
      caracterHasta = (index + 1);
      let caracter = numero.substring(index, caracterHasta);
      console.log('CARACTER', caracter);
      codigo = caracter.toLocaleUpperCase().charCodeAt(0);
      console.log('CODIGO', codigo);
      if (!(codigo >= 48 && codigo <= 57)) {
        numeroAl = numeroAl.concat(codigo.toString());
      } else {
        numeroAl = numeroAl.concat(caracter.toString());
      }
      console.log('numeroAl', numeroAl);
    }
    console.log('numeroAl length', numeroAl.length);
    for (let i = numeroAl.length - 1; i >= 0; i--) {
      console.log('numeroAl pos=', i);
      if (k > BASEMAX) {
        k = 2;
      }
      let numeroAux = +numeroAl.substr(i, 1);
      total = total + (numeroAux * k);
      k = k + 1;
    }

    const resto = (total % BASEMAX);
    if (resto > 1) {
      console.log('DIGITO:', (BASEMAX - resto));
      return (11 - resto);
    } else {
      console.log('DIGITO:', 0);
      return 0;
    }
  }
}
