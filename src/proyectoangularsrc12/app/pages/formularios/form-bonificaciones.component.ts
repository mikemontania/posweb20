import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, MedioPagoService, ListaPrecioService, GrupoMaterialService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { MedioPago } from '../../models/medioPago.model';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { User } from '../../models/user.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { Sucursal } from '../../models/sucursal.model';
import { Bonificacion } from '../../models/bonificacion.model';
import { BonificacionService } from '../../services/bonificacion/bonificacion.service';
import { Producto } from '../../models/producto.model';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { GrupoMaterial } from '../../models/grupoMaterial.model';


@Component({
  selector: 'app-form-bonificaciones',
  templateUrl: './form-bonificaciones.component.html',
  styles: []
})
export class FormBonificacionComponent implements OnInit {
  bonificacion: Bonificacion = new Bonificacion();
  cliente: Cliente;
  producto: Producto;
  nombreCliente: string;
  cargadorProducto: Producto;
  cargadorMaterial: Producto;
  cargadorCliente: Cliente;
  listaPrecio: ListaPrecio[] = [];
  grupoMaterial: GrupoMaterial[] = [];
  sucursales: Sucursal[] = [];
  seleccionListaPrecio: number;
  seleccionSucursal: Sucursal;
  seleccionGrupoMaterial: GrupoMaterial;
  user: User;

  titulo: string = 'Crear Bonificacion';
  errores: ErrModel[] = [];
  tipoDoc: any[] = [
    { id: 1, descripcion: 'RUC' },
    { id: 2, descripcion: 'CI' }
  ];

  constructor(private _clienteService: ClienteService,
    private toastr: ToastrService,
    private _medioPagoServices: MedioPagoService,
    private _listaPrecioServices: ListaPrecioService,
    private _grupoMaterialServices: GrupoMaterialService,
    private _loginService: LoginService,
    private _sucursalesServices: SucursalesService,
    private _bonificacionService: BonificacionService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.bonificacion.descripcion = '';
    this.bonificacion.codEmpresa = this._loginService.user.codEmpresa;
    this.bonificacion.tipoBonificacion = '';
    this.bonificacion.fechaDesde = null;
    this.bonificacion.fechaHasta = null;
    this.bonificacion.producto = null;
    this.bonificacion.materialBonif = null;
    this.bonificacion.cliente = null;
    this.bonificacion.listaPrecio = null;
    this.bonificacion.grpMaterial = '';
    this.bonificacion.cantBonif = 0;
    this.bonificacion.cantDesde = 1;
    this.bonificacion.cantHasta = 1;
    this.bonificacion.cantBonif = 1;
    this.bonificacion.activo = true;

  }

  ngOnInit() {
    this.user = this._loginService.user;
    this.cargarSucursales();
    this.cargarGrupoMaterial();
    this.cargarlistaPrecio();

    if (!this.bonificacion.activo) {
      this.bonificacion.activo = true;
    }
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._bonificacionService.getById(id).subscribe(async (bonificacion) => {
          this.bonificacion = bonificacion;
          console.log(bonificacion);

          if (bonificacion.producto) {
            this.cargadorProducto = bonificacion.producto;
          }

          if (bonificacion.materialBonif) {
            this.cargadorMaterial = bonificacion.materialBonif;
          }
 
          if (bonificacion.cliente) {
            this.cargadorCliente = bonificacion.cliente;
            this.nombreCliente = bonificacion.cliente.razonSocial;
          } else {
            $('#typeahead-clientes').val('');
            this.nombreCliente = '';
          }

          if (bonificacion.listaPrecio) {
            $('#selectListaPrecio').val(bonificacion.listaPrecio.codListaPrecio);
            this.seleccionListaPrecio = bonificacion.listaPrecio.codListaPrecio;
          } else {
            this.seleccionListaPrecio = null;
          }
          if (this.bonificacion.grpMaterial) {
            this.seleccionGrupoMaterial = await this.findGrupoById(this.bonificacion.grpMaterial);
            console.log(this.seleccionGrupoMaterial);
          } else {
            this.seleccionGrupoMaterial = null;
          }
           if (this.bonificacion.codSucursal) {
            this.seleccionSucursal = await this.findSucursal(this.bonificacion.codSucursal);
          } else {
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
    console.log(this.bonificacion);
    if (this.bonificacion.tipoBonificacion) {
      if ((this.bonificacion.tipoBonificacion === 'PRODUCTO') && !this.bonificacion.producto) {
        this.invalido('Producto no puede ser nulo en este tipo de bonificacion');
        return;
      }
      if (this.bonificacion.tipoBonificacion === 'CLIENTE' && !this.bonificacion.cliente) {
        this.invalido('Cliente no puede ser nulo en este tipo de bonificacion');
        return;
      }

      if (this.bonificacion.tipoBonificacion === 'KIT' && !this.bonificacion.grpMaterial) {
        this.invalido('GrpMaterial no puede ser nulo en este tipo de bonificacion');
        return;
      }
      
    } else {
      this.invalido('TipoBonificacion no puede ser nulo');
      return;
    }
    if (!this.bonificacion.cantBonif || this.bonificacion.cantBonif === 0) {
      this.invalido('cantidad bonificacion no puede ser nulo');
      return;
    }
    
    if (!this.bonificacion.fechaDesde) {
      this.invalido('fechaDesde no puede ser nulo');
      return;
    }
    if (!this.bonificacion.fechaHasta) {
      this.invalido('fechaHasta no puede ser nulo');
      return;
    }

    if (!this.bonificacion.cantDesde) {
      this.invalido('cantDesde no puede ser nulo');
      return;
    }
    if (!this.bonificacion.cantHasta) {
      this.invalido('cantHasta no puede ser nulo');
      return;
    }


    if (!this.bonificacion.codSucursal) {
      this.invalido('Sucursal no puede ser nulo');
      return;
    }
    if (!this.bonificacion.listaPrecio) {
      this.invalido('Lista precio no puede ser nulo');
      return;
    }

    this.bonificacion.codEmpresa = this.user.codEmpresa;
    console.log(this.bonificacion);
    this._bonificacionService.create(this.bonificacion)
      .subscribe(
        cliente => {
          this.router.navigate(['/bonificaciones']);
          swal.fire('Nuevo Bonificacion', `El bonificacion ${this.bonificacion.descripcion} ha sido creado con éxito`, 'success');
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
    console.log(this.bonificacion);
    if (this.bonificacion.tipoBonificacion) {
      if ((this.bonificacion.tipoBonificacion === 'PRODUCTO') && !this.bonificacion.producto) {
        this.invalido('Producto no puede ser nulo en este tipo de bonificacion');
        return;
      }
      if (this.bonificacion.tipoBonificacion === 'CLIENTE' && !this.bonificacion.cliente) {
        this.invalido('Cliente no puede ser nulo en este tipo de bonificacion');
        return;
      }

      if (this.bonificacion.tipoBonificacion === 'KIT' && !this.bonificacion.grpMaterial) {
        this.invalido('GrpMaterial no puede ser nulo en este tipo de bonificacion');
        return;
      }
      
    } else {
      this.invalido('TipoBonificacion no puede ser nulo');
      return;
    }
    if (!this.bonificacion.cantBonif || this.bonificacion.cantBonif === 0) {
      this.invalido('cantidad bonificacion no puede ser nulo');
      return;
    }
    
    if (!this.bonificacion.fechaDesde) {
      this.invalido('fechaDesde no puede ser nulo');
      return;
    }
    if (!this.bonificacion.fechaHasta) {
      this.invalido('fechaHasta no puede ser nulo');
      return;
    }
    if (!this.bonificacion.cantDesde) {
      this.invalido('cantDesde no puede ser nulo');
      return;
    }
    if (!this.bonificacion.cantHasta) {
      this.invalido('cantHasta no puede ser nulo');
      return;
    }
    if (!this.bonificacion.codSucursal) {
      this.invalido('Sucursal no puede ser nulo');
      return;
    }
    if (!this.bonificacion.listaPrecio) {
      this.invalido('Lista precio no puede ser nulo');
      return;
    }

    this.bonificacion.codEmpresa = this.user.codEmpresa;
    console.log(this.bonificacion);
    this._bonificacionService.update(this.bonificacion)
      .subscribe(
        (json: Bonificacion) => {
          this.router.navigate(['/bonificaciones']);
          swal.fire('Bonificacion Actualizado', `Bonificacion  : ${json.descripcion}`, 'success');
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
 
  findSucursal(cod) {
    let response = this._sucursalesServices.getSucursalbyId(cod).toPromise();
    return response;
  }


  findGrupoById(cod) {
    let response = this._grupoMaterialServices.getById(cod).toPromise();
    return response;
  }
 

  cargarSucursales() {
    this._sucursalesServices.traerSucursales(this.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.sucursales = resp;
    });
  }

  cargarGrupoMaterial() {
    this._grupoMaterialServices.getByCodEmpresa(this.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.grupoMaterial = resp;
    });
  }

  cargarlistaPrecio() {
    this._listaPrecioServices.traerListaPrecio(this.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.listaPrecio = resp;
    });
  }
 
  cambioListaPrecio(evento) {
    this.bonificacion.listaPrecio = evento;
  }

  cambioSucursal(sucursal: Sucursal) {
    if (sucursal) {
      this.seleccionSucursal = sucursal;
      this.bonificacion.codSucursal = sucursal.codSucursal;
    }
  }

  cambioGrupo(grupo: GrupoMaterial) {
    if (grupo) {
      this.seleccionGrupoMaterial = grupo;
      this.bonificacion.grpMaterial = grupo.codGrupoErp;
    }
  }

  cambioTipoBonificacion(event) {
    let tipo = event;
    this.cargadorProducto = null;
    this.bonificacion.producto = null;
    this.cargadorCliente = null;
    this.bonificacion.cliente = null;
    this.bonificacion.grpMaterial = null;

  }
 
  seleccionarCliente(item: Cliente) {
    this.cliente = item;
    this.cargadorCliente = item;
    this.bonificacion.cliente = item;
    console.log(item.codCliente);
  }


  cleanGrupo() {

    this.bonificacion.grpMaterial = null;
    this.seleccionGrupoMaterial = null;
  }
  cleanLista() {
    this.bonificacion.listaPrecio = null;
  }
  cleanSucursal() {

    this.bonificacion.codSucursal = null;
    this.seleccionSucursal = null;
  }
  seleccionarProducto(item: Producto) {
    console.log(item);
    this.cargadorProducto = item;
    this.bonificacion.producto = item;
  }
  seleccionarMaterial(item: Producto) {
    console.log(item);
    this.cargadorMaterial = item;
    this.bonificacion.materialBonif = item;
  }

  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }


}
