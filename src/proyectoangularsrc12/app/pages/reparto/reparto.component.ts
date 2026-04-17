import { Component, OnInit, OnChanges, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';

import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { VentasService } from '../../services/ventas/ventas.service';

import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { LoginService, UsuarioService, PedidosService, RepartoService, SucursalesService } from '../../services/service.index';

import { Chofer } from '../../models/chofer.model';
import { Pedido } from '../../models/pedido.model';
import { Venta } from '../../models/venta.model';
import * as moment from 'moment';
import { Vehiculo } from '../../models/vehiculo.model';
import { Reparto } from '../../models/reparto.model';
import { RepartoDetalle } from '../../models/repartoDetalle.model';
import { RepartoDocs } from '../../models/repartoDocs.model';
import { VentaDetalle } from '../../models/VentaDetalle.model';
import { PedidoDetalle } from '../../models/PedidoDetalle.model';
import { Cliente } from '../../models/cliente.model';
import { Usuarios } from '../../models/usuarios.model';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { Sucursal } from '../../models/sucursal.model';

@Component({
  selector: 'app-reparto',
  templateUrl: './reparto.component.html',
  styles: [`
  agm-map {
    height: 500px;
  }
  `]
})
export class RepartoComponent implements OnInit {
  linkBase = 'http://www.google.com/maps/place/';
  lat = -25.29688941637652;
  lng = -57.59492960130746;
  previous: any;
  zoomMap: number = 14;
  _modoFomulario: string = 'REPARTO';
  mask = [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  nroComprobante: string = '';
  _id: number = 0;
  code: number = 0;
  _modoConsulta: boolean;
  reparto: Reparto;
  cargadorClientePedido: Cliente;
  cargadorClienteVenta: Cliente;
  clientePedido: Cliente;
  clienteVenta: Cliente;
  repartoDetalles: RepartoDetalle[] = [];
  repartoDocs: RepartoDocs[] = [];
  repartoDocsAuxi: RepartoDocs[] = [];
  sucursales: Sucursal[] = [];
  sucursal: Sucursal;
  codSucursal: number;
  cargadorSucursal: Sucursal;
  seleccionSucursal: number;
  rol: string;
  paginaDocs: number = 0;
  pageSizeDocs: number = 0;
  paginaDetalles: number = 0;
  pageSizeDetalles: number = 0;
  modalPedidos: string = 'oculto';
  paginaPedido: number = 0;
  pageSizePedido: number = 0;
  listaPedidos: Pedido[] = [];
  pedidosReparto: Pedido[] = [];
  totalElementosPedido: number = 0;
  fechaInicioPedido: string;
  fechaFinPedido: string;
  obsReparto: string = '';
  modalVentas: string = 'oculto';
  paginaVenta: number = 0;
  pageSizeVenta: number = 0;
  listaVenta: Venta[] = [];
  ventaReparto: Venta[] = [];
  fechaInicioVenta: string;
  fechaFinVenta: string;
  totalElementosVenta: number = 0;
  fechaReparto: string;
  tamanhoPag: number = 10;
  nroPedido: number = 0;
  chofer: Chofer;
  cargadorChofer: Chofer;
  ayudante1: Chofer;
  cargadorAyudante1: Chofer;
  ayudante2: Chofer;
  cargadorAyudante2: Chofer;
  sinImagen: string = './assets/images/sin-imagen.jpg';
  vehiculo: Vehiculo;
  cargadorVehiculo: Vehiculo;
  public numeros: ObjetoSelector[] = [
    { cod: 10, descripcion: '10', enum: '10' },
    { cod: 15, descripcion: '15', enum: '15' },
    { cod: 20, descripcion: '20', enum: '20' },
    { cod: 25, descripcion: '25', enum: '25' },
    { cod: 30, descripcion: '30', enum: '30' },
    { cod: 40, descripcion: '40', enum: '40' },
    { cod: 50, descripcion: '50', enum: '50' },
    { cod: 100, descripcion: '100', enum: '100' }
  ];
  constructor(private _ventasService: VentasService,
    private _location: Location,
    private _pedidosServices: PedidosService,
    private _sucursalesServices: SucursalesService,
    public _loginServices: LoginService,
    private _usuariosServices: UsuarioService,
    private _repartoServices: RepartoService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public http: HttpClient
  ) { }


  async ngOnInit() {
    this._modoConsulta = false;
    this.rol = this._loginServices.user.authorities[0];
    this.nroPedido = 0;
    this.repartoInit();
    this.seleccionarClientePedido(null);
    this.seleccionarClienteVenta(null);
    this.pageSizePedido = 20;
    this.pageSizeVenta = 20;
    this.nroComprobante = '';
    this._modoFomulario = 'REPARTO';
    this.paginaDocs = 1;
    this.pageSizeDocs = 10;
    this.paginaDetalles = 1;
    this.pageSizeDetalles = 10;
    this.fechaReparto = moment(new Date()).format('YYYY-MM-DD');
    this.cargadorChofer = null;
    this.cargadorAyudante1 = null;
    this.cargadorAyudante2 = null;
    this.cargadorVehiculo = null;
    this.codSucursal = this._loginServices.user.codSucursal;
    this.cargadorSucursal = await this.cargarSucursalById(this.codSucursal);
    if (this.rol == 'ROLE_CAJERO') {
      this.codSucursal = this._loginServices.user.codSucursal;
      this.cargarSucursalPorId(this.codSucursal);
    }
    this.repartoDetalles = [];
    this.repartoDocs = [];
    this.repartoDocsAuxi = [];
    this.activatedRoute.paramMap.subscribe(async params => {
      let code = +params.get('code');
      if (code) {
        this.code = code;
        this._modoConsulta = true;
        this.clearStorage();
        console.log('_modoConsulta', this._modoConsulta);
        await this.cargarReparto(this.code);
      }
    });
    if (localStorage.getItem('repartoStorage')) { // guardarhistorial
      this.reparto = JSON.parse(localStorage.getItem('repartoStorage'));
      this.repartoDetalles = this.reparto.detalle;
      this.repartoDocs = this.reparto.documento;
      this.repartoDocsAuxi = this.reparto.documento;
      this.vehiculo = this.reparto.vehiculo;
      this.ayudante1 = this.reparto.ayudante1;
      this.ayudante2 = this.reparto.ayudante2;
      this.cargadorVehiculo = this.reparto.vehiculo;
      this.cargadorAyudante1 = this.reparto.ayudante1;
      this.cargadorAyudante2 = this.reparto.ayudante2;
      this.chofer = this.reparto.chofer;
      this.cargadorChofer = this.reparto.chofer;
      console.log(this.reparto);
    } else {
      this.activatedRoute.paramMap.subscribe(async params => {
        let id = +params.get('id');
        if (id) {
          this._id = id;
          await this.cargarReparto(this._id);
        }
      });


    }

  }

  cancelar() {
    this.clearStorage();
    this.ngOnInit();
  }

  writeStorage() {
    this.reparto.detalle = this.repartoDetalles;
    this.reparto.documento = this.repartoDocs;
    localStorage.setItem('repartoStorage', JSON.stringify(this.reparto));
  }
  clearStorage() {
    localStorage.removeItem('repartoStorage');
  }

  async quitarPedido(doc: RepartoDocs) {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Quitando pedido...',
    });
    Swal.showLoading();
    let response = await this.traerPedidoPorId(doc.pedido.codPedido);
    let pedidoDetalles: PedidoDetalle[] = [];
    let pedido: Pedido = response.pedido;
    pedidoDetalles = pedido.detalle;
    console.log(pedido);
    console.log(pedidoDetalles);
    // ================= Restar Detalles ========= //
    for await (const detalle of pedidoDetalles) {
      console.log(detalle);
      let indiceReparoDetalle = this.repartoDetalles.findIndex((d) => d.producto.codProducto == detalle.producto.codProducto);
      console.log('indiceReparoDetalle= ', indiceReparoDetalle);
      this.repartoDetalles[indiceReparoDetalle].cantidad = this.repartoDetalles[indiceReparoDetalle].cantidad - detalle.cantidad;
      this.repartoDetalles[indiceReparoDetalle].totalGs = this.repartoDetalles[indiceReparoDetalle].totalGs - detalle.importeTotal;
      this.repartoDetalles[indiceReparoDetalle].totalKg = this.repartoDetalles[indiceReparoDetalle].totalKg - detalle.producto.peso;
      if (this.repartoDetalles[indiceReparoDetalle].cantidad == 0) { // si esta vacio, es eliminado
        this.repartoDetalles.splice(indiceReparoDetalle, 1);
      }
    }
    // ================= Restar de  total reparto ========= //
    this.reparto.totalGs = this.reparto.totalGs - doc.totalGs;
    this.reparto.totalKg = this.reparto.totalKg - doc.totalKg;
    // =================quitar del array ========= //
    let index = this.repartoDocs.indexOf(doc);
    this.repartoDocs.splice(index, 1);
    this.repartoDocsAuxi = this.repartoDocs;
    Swal.close();
    this.confirmacion('Se ha quitado el pedido');
    this.writeStorage();
    return true;
  }
  async quitarVenta(doc: RepartoDocs) {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Quitando venta...',
    });
    Swal.showLoading();
    let response = await this.traerModeloPorId(doc.venta.codVenta);
    let ventaDetalles: VentaDetalle[] = [];
    let venta: Venta = response.venta;
    ventaDetalles = venta.detalle;
    console.log(venta);
    console.log(ventaDetalles);
    // ================= Restar Detalles ========= //
    for await (const detalle of ventaDetalles) {
      console.log(detalle);
      let indiceReparoDetalle = this.repartoDetalles.findIndex((d) => d.producto.codProducto == detalle.producto.codProducto);
      console.log('indiceReparoDetalle= ', indiceReparoDetalle);
      this.repartoDetalles[indiceReparoDetalle].cantidad = this.repartoDetalles[indiceReparoDetalle].cantidad - detalle.cantidad;
      this.repartoDetalles[indiceReparoDetalle].totalGs = this.repartoDetalles[indiceReparoDetalle].totalGs - detalle.importeTotal;
      this.repartoDetalles[indiceReparoDetalle].totalKg = this.repartoDetalles[indiceReparoDetalle].totalKg - detalle.producto.peso;
      if (this.repartoDetalles[indiceReparoDetalle].cantidad == 0) { // si esta vacio, es eliminado
        this.repartoDetalles.splice(indiceReparoDetalle, 1);
      }
    }
    // ================= Restar de  total reparto ========= //
    this.reparto.totalGs = this.reparto.totalGs - doc.totalGs;
    this.reparto.totalKg = this.reparto.totalKg - doc.totalKg;
    // =================quitar del array ========= //
    let index = this.repartoDocs.indexOf(doc);
    this.repartoDocs.splice(index, 1);
    this.repartoDocsAuxi = this.repartoDocs;
    Swal.close();
    this.confirmacion('Se ha quitado la venta');
    this.writeStorage();
    return true;
  }
  async seleccionarVenta(item: Venta) {
    if (item.codReparto == null) {
      Swal.fire({
        allowOutsideClick: false,
        type: 'info',
        text: 'Añadiendo venta...',
      });
      Swal.showLoading();
      let response = await this.traerModeloPorId(item.codVenta);
      let ventaDetalles: VentaDetalle[] = [];
      let venta: Venta = response.venta;
      ventaDetalles = venta.detalle;
      console.log(venta);
      console.log(ventaDetalles);
      let existe = await this.existeVenta(venta);
      if (existe) {
        Swal.close();
        this.advertencia('Esta venta ya está cargada en el reparto');
        return;
      }
      for await (const detalle of ventaDetalles) {
        console.log(detalle);
        let indiceReparoDetalle = this.repartoDetalles.findIndex((d) => d.producto.codProducto == detalle.producto.codProducto);
        console.log('indiceReparoDetalle= ', indiceReparoDetalle)
        if (indiceReparoDetalle == -1) {
          let repartoDetalle: RepartoDetalle = new RepartoDetalle(null, 0, 0, null, null, null, 0, 0);
          console.log(detalle);
          repartoDetalle.producto = detalle.producto;
          repartoDetalle.unidadMedida = detalle.unidadMedida;
          repartoDetalle.cantidadUnidad = detalle.unidadMedida.cantidad;
          this.repartoDetalles.push(repartoDetalle);
          indiceReparoDetalle = this.repartoDetalles.findIndex((d) => d.producto.codProducto == detalle.producto.codProducto);
        }
        this.repartoDetalles[indiceReparoDetalle].cantidad = this.repartoDetalles[indiceReparoDetalle].cantidad + detalle.cantidad;
        this.repartoDetalles[indiceReparoDetalle].totalGs = this.repartoDetalles[indiceReparoDetalle].totalGs + detalle.importeTotal;
        this.repartoDetalles[indiceReparoDetalle].totalKg = this.repartoDetalles[indiceReparoDetalle].totalKg + detalle.producto.peso;
      }
      let repartoDocs: RepartoDocs = new RepartoDocs(null, null, null, null, null, 0, 0, '', '', '', 0, 0,0);
      repartoDocs.fechaReparto = this.fechaReparto;
      repartoDocs.cliente = venta.cliente;
      repartoDocs.venta = venta;
      repartoDocs.tipo = 'VENTA';
      repartoDocs.pedido = null;
      repartoDocs.docNro = venta.nroComprobante;
      repartoDocs.totalGs = venta.importeTotal;
      repartoDocs.totalKg = await this.calcularTotalKgV(ventaDetalles);
      repartoDocs.latitud = venta.cliente.latitud;
      repartoDocs.longitud = venta.cliente.longitud;
      this.repartoDocs.push(repartoDocs);
      this.repartoDocsAuxi = this.repartoDocs;
      let total = await this.sumarTotales();
      Swal.close();
      this.confirmacion('Se ha agregado la venta');
      this.writeStorage();
      return true;
    } else {
      this.advertencia('El Documento ya tiene un reparto');
    }
  }
  async seleccionarPedido(item: Pedido) {
    if (item.codReparto == null) {
      Swal.fire({
        allowOutsideClick: false,
        type: 'info',
        text: 'Añadiendo Pedido...',
      });
      Swal.showLoading();
      let response = await this.traerPedidoPorId(item.codPedido);
      let pedidoDetalles: PedidoDetalle[] = [];
      let pedido: Pedido = response.pedido;
      pedidoDetalles = pedido.detalle;
      console.log(pedido);
      console.log(pedidoDetalles);
      let existe = await this.existePedido(pedido);
      if (existe) {
        Swal.close();
        this.advertencia('El pedido ya está cargado en el reparto');
        return;
      }
      for await (const detalle of pedidoDetalles) {
        console.log(detalle);
        let indiceReparoDetalle = this.repartoDetalles.findIndex((d) => d.producto.codProducto == detalle.producto.codProducto);
        console.log('indiceReparoDetalle= ', indiceReparoDetalle)
        if (indiceReparoDetalle == -1) {
          let repartoDetalle: RepartoDetalle = new RepartoDetalle(null, 0, 0, null, null, null, 0, 0);
          console.log(detalle);
          repartoDetalle.producto = detalle.producto;
          repartoDetalle.unidadMedida = detalle.unidadMedida;
          repartoDetalle.cantidadUnidad = detalle.unidadMedida.cantidad;
          this.repartoDetalles.push(repartoDetalle);
          indiceReparoDetalle = this.repartoDetalles.findIndex((d) => d.producto.codProducto == detalle.producto.codProducto);
        }
        this.repartoDetalles[indiceReparoDetalle].cantidad = this.repartoDetalles[indiceReparoDetalle].cantidad + detalle.cantidad;
        this.repartoDetalles[indiceReparoDetalle].totalGs = this.repartoDetalles[indiceReparoDetalle].totalGs + detalle.importeTotal;
        this.repartoDetalles[indiceReparoDetalle].totalKg = this.repartoDetalles[indiceReparoDetalle].totalKg + detalle.producto.peso;
      }
      let repartoDocs: RepartoDocs = new RepartoDocs(null, null, null, null, null, 0, 0, '', '', '', null, null,0);
      repartoDocs.fechaReparto = this.fechaReparto;
      repartoDocs.venta = null;
      repartoDocs.cliente = pedido.cliente;
      repartoDocs.tipo = 'PEDIDO';
      repartoDocs.pedido = pedido;
      repartoDocs.docNro = pedido.nroPedido.toString();
      repartoDocs.totalGs = pedido.importeTotal;
      repartoDocs.latitud = pedido.cliente.latitud;
      repartoDocs.longitud = pedido.cliente.longitud;
      repartoDocs.totalKg = await this.calcularTotalKgP(pedidoDetalles);
      this.repartoDocs.push(repartoDocs);
      this.repartoDocsAuxi = this.repartoDocs;
      let total = await this.sumarTotales();
      Swal.close();
      this.confirmacion('Se ha agregado el pedido');
      this.writeStorage();
      return true;
    } else {
      this.advertencia('El Documento ya tiene un reparto');
    }
  }

  async seleccionarPaginaPedido() {
    for await (const pedido of this.listaPedidos) {
      let a = await this.seleccionarPedido(pedido);
    }
    this.writeStorage();
    this.confirmacion('Se ha agregado la pagina');
  }

  async seleccionarPaginaVenta() {
    for await (const venta of this.listaVenta) {
      let a = await this.seleccionarVenta(venta);
    }
    this.writeStorage();
    this.confirmacion('Se ha agregado la pagina');
  }


  calcularTotalKgP(pedidoDetalle: PedidoDetalle[]): Promise<number> {
    return new Promise<number>(async (resolve) => {
      let totalKg = 0;
      for await (const detalle of pedidoDetalle) {
        totalKg = totalKg + detalle.producto.peso;
      }
      resolve(totalKg);
    });
  }
  existeVenta(venta: Venta): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve) => {
      for await (const doc of this.repartoDocs) {
        if (doc.venta && doc.venta.codVenta == venta.codVenta) {
          resolve(true);
        }
      }
      resolve(false);
    });
  }
  existePedido(pedido: Pedido): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve) => {
      for await (const doc of this.repartoDocs) {
        if (doc.pedido && doc.pedido.codPedido == pedido.codPedido) {
          resolve(true);
        }
      }
      resolve(false);
    });
  }
  calcularTotalKgV(ventaDetalle: VentaDetalle[]): Promise<number> {
    return new Promise<number>(async (resolve) => {
      let totalKg = 0;
      for await (const detalle of ventaDetalle) {
        totalKg = totalKg + detalle.producto.peso;
      }
      resolve(totalKg);
    });
  }
  sumarTotales(): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve) => {
      this.reparto.totalGs = 0
      this.reparto.totalKg = 0;
      for await (const doc of this.repartoDocs) {
        this.reparto.totalGs = this.reparto.totalGs + doc.totalGs;
        this.reparto.totalKg = this.reparto.totalKg + doc.totalKg;
      }
      resolve(true);
    });
  }

  async cargarReparto(id: number) {
    this.reparto = await this.traerRepartoPorId(id);
    console.log('modeloooooooooooooooooooooooooooo');
    this.repartoDetalles = this.reparto.detalle;
    this.repartoDocs = this.reparto.documento;
    this.repartoDocsAuxi = this.repartoDocs;
    this.vehiculo = this.reparto.vehiculo;
    this.ayudante1 = this.reparto.ayudante1;
    this.ayudante2 = this.reparto.ayudante2;
    this.cargadorVehiculo = this.reparto.vehiculo;
    this.cargadorAyudante1 = this.reparto.ayudante1;
    this.cargadorAyudante2 = this.reparto.ayudante2;
    this.chofer = this.reparto.chofer;
    this.cargadorChofer = this.reparto.chofer;
    this.writeStorage();
    console.log(this.reparto);
  }



  async mostrarPedidos() {
    this.fechaInicioPedido = moment(new Date()).format('YYYY-MM-DD');
    this.fechaFinPedido = moment(new Date()).format('YYYY-MM-DD');
    //this.modalPedidos = '';
    this._modoFomulario = 'PEDIDOS';
    let res = await this.pedidoFindByFecha(0, this.fechaInicioPedido, this.fechaFinPedido, null, null, this.codSucursal, this.pageSizePedido, 'PENDIENTE', false, 0);
    console.log(res);
    this.totalElementosPedido = res.totalElements;
    this.listaPedidos = res.content;
    console.log(this.listaPedidos);
    console.log(this.totalElementosPedido);
    console.log(this.pageSizePedido);
  }
  async buscarPedido() {
    this.paginaPedido = 1;
    let res = await this.pedidoFindByFecha(0, this.fechaInicioPedido, this.fechaFinPedido, this.clientePedido, null, this.codSucursal, this.pageSizePedido, 'PENDIENTE', false, this.nroPedido);
    console.log(res);
    this.totalElementosPedido = res.totalElements;
    this.listaPedidos = res.content;
    console.log(this.listaPedidos);
    console.log(this.totalElementosPedido);
    console.log(this.pageSizePedido);
  }
  cancelarPedidos() {
    this.seleccionarClientePedido(null);
    // this.modalPedidos = 'oculto';
    this._modoFomulario = 'REPARTO';
  }

  async cargarPaginaPedidos(page: number) {
    let p = page - 1;
    let res = await this.pedidoFindByFecha(p, this.fechaInicioPedido, this.fechaFinPedido, null, null, this.codSucursal, this.pageSizePedido, 'PENDIENTE', false, 0);
    this.listaPedidos = res.content;
    console.log(this.listaPedidos);
    console.log(this.totalElementosPedido);
    console.log(this.pageSizePedido);
  }


  async mostrarVenta() {
    this.fechaInicioVenta = moment(new Date()).format('YYYY-MM-DD');
    this.fechaFinVenta = moment(new Date()).format('YYYY-MM-DD');
    this._modoFomulario = 'VENTAS';
    //this.modalVentas = '';

    this.paginaVenta = 1;
    let response = await this.ventaFindByFecha(0, this.fechaInicioVenta, this.fechaFinVenta, null, null, this.cargadorSucursal, '', '', this.pageSizeVenta, false);
    console.log(response);
    this.totalElementosVenta = response.totalElements;
    this.listaVenta = response.content;
    console.log(this.listaVenta);
    console.log(this.totalElementosVenta);
    console.log(this.pageSizeVenta);
  }
  async buscarVentas() {
    this.paginaVenta = 1;
    let response = await this.ventaFindByFecha(0, this.fechaInicioVenta, this.fechaFinVenta, this.clienteVenta, null, this.cargadorSucursal, this.nroComprobante, '', this.pageSizeVenta, false);
    console.log(response);
    this.totalElementosVenta = response.totalElements;
    this.listaVenta = response.content;
    console.log(this.listaVenta);
    console.log(this.totalElementosVenta);
    console.log(this.pageSizeVenta);
  }
  async cargarPaginaVenta(page: number) {
    let p = page - 1;
    let response = await this.ventaFindByFecha(p, this.fechaInicioVenta, this.fechaFinVenta, null, null, this.cargadorSucursal, '', '', this.pageSizeVenta, false);
    console.log(response);
    this.totalElementosVenta = response.totalElements;
    this.listaVenta = response.content;
    console.log(this.listaVenta);
    console.log(this.totalElementosVenta);
    console.log(this.pageSizeVenta);
  }
  cancelarVentas() {
    // this.modalVentas = 'oculto';
    this._modoFomulario = 'REPARTO';
    this.seleccionarClienteVenta(null);
    this.nroComprobante = '';

  }

  guardarReparto() {
    if (!this.chofer) {
      this.advertencia('Chofer es obligatorio');
      return;
    }
    if (!this.vehiculo) {
      this.advertencia('Camion es obligatorio');
      return;
    }
    if (!this.fechaReparto) {
      this.advertencia('La fecha es obligatoria');
      return;
    }
    if (this.repartoDocs.length == 0) {
      this.advertencia('Es obligatorio cargar documentos al reparto');
      return;
    }
    this.reparto.fechaReparto = this.fechaReparto;
    this.reparto.chofer = this.chofer;
    this.reparto.ayudante1 = this.ayudante1;
    this.reparto.ayudante2 = this.ayudante2;
    this.reparto.vehiculo = this.vehiculo;
    this.reparto.detalle = this.repartoDetalles;
    this.reparto.documento = this.repartoDocs;
    console.log(this.reparto);
    console.log(JSON.stringify(this.reparto));
    if (this.reparto.codReparto) {
      this._repartoServices.cerrar(this.reparto).subscribe((response: any) => {
        Swal.fire('Completado !!!', 'Se ha credo el reparto exitosamente!!!', 'success');
        this.clearStorage();
        this.router.navigate(['listaReparto']);
      });
    } else {
      this._repartoServices.cerrar(this.reparto).subscribe((response: any) => {
        Swal.fire('Completado !!!', 'Se ha credo el reparto exitosamente!!!', 'success');
        this.clearStorage();
        this.router.navigate(['listaReparto']);
      });
    }

  }


  openLink() {
    let newLink = this.linkBase + this.lat + ',' + this.lng;
    window.open(newLink, '_blank');
  }
  zoomMarcador(repartoDoc: RepartoDocs) {
    console.log(repartoDoc);
    if (repartoDoc.latitud != 0 && repartoDoc.longitud != 0) {
      this.lat = repartoDoc.latitud;
      this.lng = repartoDoc.longitud;
      this.zoomMap = 15;
    } else {
      this.lat = -25.29688941637652;
      this.lng = -57.59492960130746;
      this.zoomMap = 7;
      this.advertencia('El cliente no tiene ubicacion');
    }
  }

  atras() {
    this._location.back();
    //  this.router.navigate(['listaReparto']);

  }
  clickedMarker(infowindow) {
    console.log(infowindow);
    if (this.previous) {
      this.previous.close();
    }
    this.previous = infowindow;
  }

  buscar(event) {
    this.lat = -25.29688941637652;
    this.lng = -57.59492960130746;
    this.zoomMap = 7;
    console.log(event);
    if (event == '') {
      this.repartoDocsAuxi = this.repartoDocs;
    } else {
      this.repartoDocsAuxi = this.repartoDocs.filter(doc =>
        true == doc.cliente.razonSocial.toLowerCase().includes(event.toLocaleLowerCase())
        || true == doc.cliente.docNro.toLowerCase().includes(event.toLocaleLowerCase())
        || true == doc.docNro.toLowerCase().includes(event.toLocaleLowerCase())
      )
        .splice(0, 10);

    }
  }

  cambioNumero(numero) {
    this.pageSizePedido = numero;
    this.pageSizeVenta = numero;
  }

  cambioSucursal(EVENTO) {
    this.seleccionSucursal = EVENTO;
    this.codSucursal = EVENTO;
  }
  seleccionarSucursal(item: Sucursal) {
    this.sucursal = item;
    this.cargadorSucursal = item;
  }
  // =================================================================Async===========================================================/

  async traerModeloPorId(cod) {
    let response = this._ventasService.traerVentaPorID(cod).toPromise();
    return response;
  }

  async ventaFindByFecha(page, fechainicio, fechafin, cliente, usuario, sucursal, nroComprobante, estado, size, anulado) {
    let response = this._ventasService.findByFecha(page, fechainicio, fechafin, cliente, usuario, sucursal, nroComprobante,'', estado, size, anulado)
      .toPromise();
    return response;
  }

  async pedidoFindByFecha(page: any, fechainicio: any, fechafin: any, cliente: Cliente, usuario: Usuarios, codSucursal: number, size: number, estado: string, anulado: any, nroPedido: number) {
    let response = this._pedidosServices.findByFecha(page, fechainicio, fechafin, cliente, usuario, codSucursal, size, estado, anulado,'', nroPedido)
      .toPromise();
    return response;
  }


  async traerPedidoPorId(cod) {
    let pedido = this._pedidosServices.getById(cod).toPromise();
    return pedido;
  }

  async traerRepartoPorId(cod) {
    let repartoModel = this._repartoServices.getById(cod).toPromise();
    return repartoModel;
  }

  // =================================================================Seccion Selectores===========================================================/

  seleccionarClientePedido(item: Cliente) {
    this.clientePedido = item;
    this.cargadorClientePedido = item;
  }
  seleccionarClienteVenta(item: Cliente) {
    this.clienteVenta = item;
    this.cargadorClienteVenta = item;
  }

  seleccionarVehiculo(item: Vehiculo) {
    this.vehiculo = item;
    this.cargadorVehiculo = item;
  }
  async seleccionarChofer(item: Chofer) {
    this.chofer = item;
    this.cargadorChofer = item;
    let personaRepetido: boolean = await this.verificar();
    if (personaRepetido) {
      this.cargadorChofer = null;
      this.chofer = null;
      this.advertencia(item.chofer + ' ya fue seleccionado');
    }
  }
  async seleccionarAyudante1(item: Chofer) {
    this.ayudante1 = item;
    this.cargadorAyudante1 = item;
    let personaRepetido: boolean = await this.verificar();
    if (personaRepetido) {
      this.cargadorAyudante1 = null;
      this.ayudante1 = null;
      this.advertencia(item.chofer + ' ya fue seleccionado');
    }
  }
  async seleccionarAyudante2(item: Chofer) {
    this.ayudante2 = item;
    this.cargadorAyudante2 = item;
    let personaRepetido: boolean = await this.verificar();
    if (personaRepetido) {
      this.cargadorAyudante2 = null;
      this.ayudante2 = null;
      this.advertencia(item.chofer + ' ya fue seleccionado');
    }
  }
  advertencia(mensajes) {
    //   Swal.fire('Atención', mensajes, 'warning');
    this.toastr.warning(mensajes, 'Atención !!!', { timeOut: 2000, });
  }

  confirmacion(mensajes) {
    this.toastr.success(mensajes, 'Agregado !!!', { timeOut: 2000, });
    //  Swal.fire('Agregado', mensajes, 'success');
  }

  verificar(): Promise<boolean> {
    return new Promise(resolve => {
      if (this.chofer && this.ayudante1 && this.ayudante2) {
        if ((this.chofer.docNro == this.ayudante1.docNro) || (this.chofer.docNro == this.ayudante2.docNro) || (this.ayudante1.docNro == this.ayudante2.docNro)) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else if (this.chofer && this.ayudante1 && !this.ayudante2) {
        if ((this.chofer.docNro == this.ayudante1.docNro)) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else if (this.chofer && this.ayudante2 && !this.ayudante1) {
        if ((this.chofer.docNro == this.ayudante2.docNro)) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else if (this.ayudante1 && this.ayudante2) {
        if ((this.ayudante1.docNro == this.ayudante2.docNro)) {
          resolve(true);
        } else {
          resolve(false);
        }
      }

    });
  }


  cargarSucursalPorId(codSuc) {
    this._sucursalesServices.getSucursalbyId(codSuc).subscribe(sucursal => {
      this.sucursales.push(sucursal);
      this.seleccionSucursal = codSuc;
      this.cargadorSucursal = sucursal;

    });
  }

  repartoInit() {
    this.reparto = {
      codReparto: null,
      codEmpresa: this._loginServices.user.codEmpresa,
      codSucursal: this._loginServices.user.codSucursal,
      anulado: false,
      chofer: this.chofer,
      ayudante1: null,
      ayudante2: null,
      vehiculo: null,
      codUsuarioCreacion: this._loginServices.user.codUsuario,
      fechaReparto: this.fechaReparto,
      fechaCreacion: null,
      fechaModificacion: null,
      totalKg: 0,
      totalGs: 0,
      usuarioCreacion: this._loginServices.user.username,
      usuarioModificacion: this._loginServices.user.username,
      obs: this.obsReparto
    };
  }

  async cargarSucursalById(cod) {
    let sucursal = this._sucursalesServices.getSucursalbyId(cod).toPromise();
    return sucursal;
  }
}
