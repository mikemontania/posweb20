import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ProductoService,   PrecioService, DescuentoService, BancosService, ProveedorService } from '../../services/service.index';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpresasService } from '../../services/empresas/empresas.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/service.index';
import { DepositoService } from '../../services/deposito/deposito.service';
import { StockService } from '../../services/stock/stock.service';
import { ComprobantesService } from '../../services/comprobantes/comprobantes.service';

import { CompraService } from '../../services/compra/compra.service';
import { Compra } from '../../models/compra.model';
import { CompraDetalle } from '../../models/compraDetalle.model';
import { Proveedor } from '../../models/proveedor.model';
import { Producto } from '../../models/producto.model';
import { Deposito } from '../../models/deposito.model';
import { UnidadMedida } from '../../models/unidadMedida.model';
import Swal from 'sweetalert2';
import * as moment from 'moment';
@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css'],
})
export class ComprasComponent implements OnInit {
  modalProveedor: string = 'oculto';
  compra: Compra;
  proveedor: Proveedor = new Proveedor();
  cargadorProveedor: Proveedor;
  cargadorProducto: Producto;
  cargadorDeposito: Deposito;
  cargadorUnidad: UnidadMedida;
  importePrecio: number;
  cantidad: number;
  porcDescuento: number;

  constructor(
    private toastr: ToastrService,
    private location: Location,
    public router: Router,
    public http: HttpClient,
    public _productosServices: ProductoService,
    public _bancosServices: BancosService,
    public _comprobanteServices: ComprobantesService,
    public _proveedorServices: ProveedorService,
    public _precioServices: PrecioService,
    public _descuentoServices: DescuentoService,
    public _loginServices: LoginService,
    public _empresaServices: EmpresasService,
    private activatedRoute: ActivatedRoute,
    private _comprasServices: CompraService,
    public _depositoServices: DepositoService,
    public _stockServices: StockService
  ) {
  }
  ngOnInit() {
    this.modalProveedor = 'oculto';
    this.proveedorInit();
    this.compraInit();
    this.cargadorDeposito = null;
    this.cargadorUnidad = null;
    this.cargadorProducto = null;
    this.cargadorProveedor = null;
  }



  async guardar() {
    if (!this.compra.fechaCompra) {
      this.invalido('Favor completar fecha de compra');
      return;
    }
    if (!this.compra.timbrado) {
      this.invalido('Favor completar timbrado');
      return;
    }
    if (!this.compra.nroComprobante) {
      this.invalido('Favor completar nroComprobante');
      return;
    }
    if (!this.compra.inicioTimbrado) {
      this.invalido('Favor completar vigencia inicio');
      return;
    }
    if (!this.compra.finTimbrado) {
      this.invalido('Favor completar vigencia fin');
      return;
    }
    if (this.compra.detalle.length <= 0) {
      this.invalido('Detalles no puede ser null');
      return;
    }
    console.log(this.proveedor);
    let verificacion = await this.verificarProveedor();
    if (!verificacion) {
      return;
    }
    console.log(this.compra);
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea grabar la compra?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, grabar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this._comprasServices.create(this.compra).subscribe(response => {
          Swal.fire('La compra se ha registrado con exito !!!', 'Finalizado!!!', 'success');
          this.ngOnInit();
        });
      }
    });
  }

  compraInit() {
    this.compra = {
      codCompra: null,
      anulado: false,
      codEmpresa: this._loginServices.user.codEmpresa,
      estado: 'SYNC',
      fechaAnulacion: null,
      fechaCreacion: null,
      fechaVencimiento: null,
      fechaCompra: moment(new Date()).format('YYYY-MM-DD'),
      fechaModificacion: null,
      porcDescuento: 0,
      importeDescuento: 0,
      importeIva5: 0,
      importeIva10: 0,
      importeIvaExenta: 0,
      importeNeto: 0,
      importeTotal: 0,
      subTotal: 0,
      timbrado: '',
      inicioTimbrado: '',
      finTimbrado: null,
      codUsuarioAnulacion: null,
      nroComprobante: '',
      tipoComprobante: 'FACTURA',
      codUsuarioCreacion: null,
      proveedor: null,
      detalle: [],
      motivoAnulacion: null,
    }
  }


  proveedorInit() {
    this.proveedor.codProveedor = null;
    this.proveedor.codEmpresa = this._loginServices.user.codEmpresa;
    this.proveedor.fechaCreacion = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    this.proveedor.fechaModificacion = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    this.proveedor.latitud = 0;
    this.proveedor.longitud = 0;
    this.proveedor.tipoDoc = 'RUC';
    this.proveedor.activo = true;
    this.proveedor.docNro = '';
    this.proveedor.razonSocial = '';
    this.proveedor.alias = '';
    this.proveedor.telefono = '';
    this.proveedor.direccion = '';
    this.proveedor.codProveedorErp = '';
    this.proveedor.email = '';
    this.proveedor.obs = '';
  }
  verificarProveedor(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (!this.proveedor.codProveedor) {
        if (!this.proveedor.docNro || this.proveedor.docNro.length < 5) {
          this.invalido('Debe completar Ruc');
          resolve(false);
        }
        if (!this.proveedor.razonSocial || this.proveedor.razonSocial.length < 5) {
          this.invalido('Debe completar Razon social');
          resolve(false);
        }
        this.proveedor.alias = this.proveedor.razonSocial;
        if (!this.proveedor.direccion) {
          this.proveedor.direccion = 'XXXXXXXXXXXXXXXXX';
        }
        if (!this.proveedor.telefono) {
          this.proveedor.telefono = 'XXXXXXXXXXXXXXXXX';
        }
        if (!this.proveedor.email) {
          this.proveedor.email = '';
        }
        this.proveedor.fechaCreacion = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        this.proveedor.fechaModificacion = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        this.proveedor.latitud = 0;
        this.proveedor.longitud = 0;
        this.proveedor.tipoDoc = (this.proveedor.docNro.includes('-')) ? 'RUC' : 'CI';
        this.proveedor.codEmpresa = this._loginServices.user.codEmpresa;
        this.proveedor.activo = true;
        let response = await this.create(this.proveedor);
        console.log('response', response);
        console.log('proveedor', this.proveedor);
        this.proveedor.codProveedor = response.codProveedor;
        this.notificacion('Cliente creado con exito!!!');
        this.compra.proveedor = this.proveedor;
      }
      this.compra.proveedor = this.proveedor;
      resolve(true);
    });
  }



  async agregarDetalle() {
    if (!this.cargadorProducto) {
      this.invalido('Producto no puede ser null');
      return;
    }
    if (!this.cargadorUnidad) {
      this.invalido('Unidad no puede ser null');
      return;
    }
    if (!this.cargadorDeposito) {
      this.invalido('Deposito no puede ser null');
      return;
    }
    if (!this.cantidad || this.cantidad <= 0) {
      this.invalido('Cantidad minima es 1');
      return;
    }
    if (!this.porcDescuento) {
      this.porcDescuento = 0;
    }
    if (!this.importePrecio || this.importePrecio <= 0) {
      this.invalido('Precio debe ser mayor a cero !!');
      return;
    }
    let detalle: CompraDetalle;
    detalle = {
      codCompraDetalle: null,
      nroItem: null,
      cantidad: 1,
      importeDescuento: 0,
      importeIva5: 0,
      importeIva10: 0,
      importeIvaExenta: 0,
      importeNeto: 0,
      importePrecio: 0,
      importeTotal: 0,
      subTotal: 0,
      porcDescuento: 0,
      porcIva: 0,
      producto: null,
      unidadMedida: null,
      compra: null,
      deposito: null
    }
    detalle.producto = this.cargadorProducto;
    detalle.unidadMedida = this.cargadorUnidad;
    detalle.deposito = this.cargadorDeposito;
    detalle.nroItem = this.compra.detalle.length + 1;
    detalle.cantidad = this.cantidad;
    detalle.importePrecio = this.importePrecio;
    detalle.subTotal = this.cantidad * this.importePrecio;
    detalle.porcIva = this.cargadorProducto.iva;
    if (this.porcDescuento > 0) {
      detalle.porcDescuento = this.porcDescuento;
      detalle.importeDescuento = Math.round((detalle.subTotal * detalle.porcDescuento) / 100);
    }
    detalle.importeTotal = detalle.subTotal - detalle.importeDescuento;
    switch (detalle.porcIva) {
      case 0:
        {
          detalle.importeIva5 = 0;
          detalle.importeIva10 = 0;
          detalle.importeIvaExenta = detalle.importeTotal;
          detalle.importeNeto = detalle.importeTotal;
        }
        break;
      case 5:
        {
          detalle.importeIva5 = Math.round(detalle.importeTotal / 21);
          detalle.importeIva10 = 0;
          detalle.importeIvaExenta = 0;
          detalle.importeNeto = detalle.importeTotal - detalle.importeIva5;
        }
        break;
      case 10:
        {
          if (detalle.producto.ivaEspecial == true) {
            detalle.importeIvaExenta = Math.round(detalle.importeTotal / 2.1);
            let gravada = Math.round(detalle.importeIvaExenta * 1.1);
            detalle.importeIva10 = Math.round(gravada / 11);
            detalle.importeIva5 = 0;
            detalle.importeNeto = detalle.importeTotal - detalle.importeIva10;
          } else {
            detalle.importeIva10 = Math.round(detalle.importeTotal / 11);
            detalle.importeIva5 = 0;
            detalle.importeIvaExenta = 0;
            detalle.importeNeto = detalle.importeTotal - detalle.importeIva10;
          }
        }
        break;
      default:
        break;
    }
    this.compra.detalle.push(detalle); /// insertar
    let calculo = await this.calcularTotales();
    this.cargadorProducto = null;
    this.cargadorUnidad = null;
    this.cargadorDeposito = null;
    this.cantidad = 1;
    this.importePrecio = 0;
    this.porcDescuento = 0;
  }
  async quitarDetalle(index) {
    this.compra.detalle.splice(index, 1);
    let calculo = await this.calcularTotales();
  }

  async calcularTotales() {
    this.compra.importeDescuento = 0;
    this.compra.importeIva10 = 0;
    this.compra.importeIva5 = 0;
    this.compra.importeIvaExenta = 0;
    this.compra.importeNeto = 0;
    this.compra.importeTotal = 0;
    this.compra.subTotal = 0;
    let i = 0;
    for await (const detalle of this.compra.detalle) {
      i += 1;
      detalle.nroItem = i;
      this.compra.importeDescuento += detalle.importeDescuento;
      this.compra.importeIva10 += detalle.importeIva10;
      this.compra.importeIva5 += detalle.importeIva5;
      this.compra.importeIvaExenta += detalle.importeIvaExenta;
      this.compra.importeNeto += detalle.importeNeto;
      this.compra.importeTotal += detalle.importeTotal;
      this.compra.subTotal += detalle.subTotal;
    }
  }

  seleccionarProveedor(item: Proveedor) {
    this.cargadorProveedor = item;
  }
  confirmarProveedor() {
    if (!this.cargadorProveedor) {
      this.proveedorInit();
      this.cargadorProveedor = null;
    } else {
      this.proveedor = this.cargadorProveedor;
    }
    this.modalProveedor = 'oculto';
  }
  seleccionarProducto(item: Producto) {
    console.log(item);
    this.cargadorProducto = item;
  }
  seleccionarDeposito(item: Deposito) {
    console.log(item);
    this.cargadorDeposito = item;
  }
  seleccionarUnidad(item: UnidadMedida) {
    console.log(item);
    this.cargadorUnidad = item;
  }
  abrirModalProveedor() {
    this.modalProveedor = '';
  }
  cancelarModalProveedor() {
    this.modalProveedor = 'oculto';
  }
  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido', { timeOut: 2200 });
    Swal.fire('Atención', invalido, 'warning');
  }

  notificacion(mensaje: string) {
    this.toastr.success(mensaje, 'Exito!!!', {
      timeOut: 1500,
    });
  }
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }
  async saveCompra(c: Compra) {
    let compra = this._comprasServices.create(c).toPromise();
    return compra;
  }
  async create(p: Proveedor) {
    let proveedor = this._proveedorServices.create(p).toPromise();
    return proveedor;
  }
}
