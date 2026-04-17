import { PipesModule } from '../pipes/pipes.module';
import { LayoutModule } from '../layout/layout.module';
import { ComponentsModule } from '../components/components.module';
import { PagesComponent } from './pages.component';

// pages

import { DashboardComponent } from './dashboard/dashboard.component';
import { AccoutSettingsComponent } from './accout-settings/accout-settings.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { RepartoListaComponent } from './reparto/repartoLista.component';
import { VendedoresComponent } from './vendedores/vendedores.component';
import { EmpresasComponent } from './empresas/empresas.component';
import { VehiculosComponent } from './vehiculos/vehiculos.component';
import { VentasComponent } from './ventas/ventas.component';
import { FormVehiculosComponent } from './formularios/form-vehiculos.component';
import { ProductosComponent } from './productos/productos.component';
import { FormChoferComponent } from './formularios/form-choferes.component';
import { FormClientesComponent } from './formularios/form-clientes.component';
import { FormVendedoresComponent } from './formularios/form-vendedores.component';
import { ChoferComponent } from './choferes/choferes.component';
import { ClientesComponent } from './clientes/clientes.component';
import { DescuentosComponent } from './descuentos/descuentos.component';
import { PreciosComponent } from './precios/precios.component';
import { RepartoComponent } from './reparto/reparto.component';
import { FormDescuentosComponent } from './formularios/form-descuentos.component';
import { FormProductosComponent } from './formularios/form-productos.component';
import { FormPreciosComponent } from './formularios/form-precios.component';
import { VentasListaComponent } from './ventasLista/ventasLista.component';
import { VentasListaDetallesComponent } from './ventasListaDetalles/ventasListaDetalles.component';
import { FormUsuarioComponent } from './formularios/form-usuario.component';
import { SucursalesComponent } from './sucursales/sucursales.component';
import { CategoriaComponent } from './categoria/categortia.component';
import { MedioPagoComponent } from './medioPago/medioPago.component';
import { UnidadMedidaComponent } from './unidadMedida/unidadMedida.component';
import { TerminalesComponent } from './terminales/terminales.component';
import { ComprobanteComponent } from './comprobantes/comprobantes.component';
import { FormSucursalesComponent } from './formularios/form-sucursales.component';
import { FormMedioPagoComponent } from './formularios/form-medioPago.component';
import { FormCategoriaComponent } from './formularios/form-categoria.component';
import { FormUnidadMedidaComponent } from './formularios/form-unidadMedida.component';
import { FormTerminalesComponent } from './formularios/form-terminales.component';
import { BancosComponent } from './bancos/bancos.component';
import { FormBancosComponent } from './formularios/form-bancos.component';
import { FormComprobantesComponent } from './formularios/form-comprobantes.component';
import { TipoMedioPagoComponent } from './tipoMedioPago/tipoMedioPago.component';
import { FormTipoMedioPagoComponent } from './formularios/form-tipoMedioPago.component';
import { FormaVentaComponent } from './formaVenta/formaVenta.component';
import { PreciosMaterialesComponent } from './preciosMateriales/preciosMateriales.component';
import { FormFormaVentaComponent } from './formularios/form-formaVenta.component';
import { TicketComponent } from './ticket/ticket';
import { Ticket80Component } from './ticket80/ticket80';
import { TicketVentaComponent } from './ticketVenta/ticketVenta';
import { ListaPrecioComponent } from './listaPrecio/listaPrecio.component';
import { FormPreciosMaterialesComponent } from './formularios/form-preciosMateriales.component';
import { FormListaPrecioComponent } from './formularios/form-listaPrecio.component';
import { MotivoAnulacionComponent } from './motivoAnulacion/motivoAnulacion.component';
import { FormMotivoAnulacionComponent } from './formularios/form-motivoAnulacion.component';
import { FormStockComponent } from './formularios/form-stock.component';
import { VTicketComponent } from './v-ticket/v-ticket';
import { FormTipoDepositoComponent } from './formularios/form-tipoDeposito.component';
import { CobranzaListaComponent } from './cobranzaLista/cobranzaLista.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { StockComponent } from './stock/stock.component';
import { PedidoListaComponent } from './pedidoLista/pedidoLista.component';
import { TipoDepositoComponent } from './tipoDeposito/tipoDeposito.component';
import { DepositosComponent } from './depositos/depositos.component';
import { FormDepositoComponent } from './formularios/form-deposito.component';

// maps
import { AgmCoreModule } from '@agm/core';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';


// pluggins
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPrintModule } from 'ngx-print';
import { NgbPaginationModule, NgbAlertModule, NgbModule, NgbHighlight } from '@ng-bootstrap/ng-bootstrap';
import { TextMaskModule } from 'angular2-text-mask';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PedidoListaDetallesComponent } from './pedidoListaDetalles/pedidoListaDetalles.component';
import { CambioPreciosComponent } from './importar/cambio-precios.component';
import { FormMotivoAnulacionCompraComponent } from './formularios/form-motivoAnulacionCompra.component';
import { FormMotivoTransferenciaComponent } from './formularios/form-motivoTranferencia.component';
import { ObsequiosComponent } from './obsequios/obsequios.component';
import {
  PerfectScrollbarModule, PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG
} from 'ngx-perfect-scrollbar';
import { VendedoresReporteComponent } from './vendedoresReporte/vendedoresReporte.component';
import { CambioPreciosCostoComponent } from './importar/cambio-preciosCosto.component';
import { ComprasComponent } from './compras/compras.component';
import { ComprasListaComponent } from './comprasLista/comprasLista.component';
import { CompraListaDetallesComponent } from './compraListaDetalles/compraListaDetalles.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { FormProveedorComponent } from './formularios/form-proveedor.component';
import { MotivoTransferenciaComponent } from './motivoTransferencia/motivoTransferencia.component';
import { MotivoAnulacionCompraComponent } from './motivoAnulacionCompra/motivoAnulacionCompra.component';
import { TransferenciaComponent } from './transferencia/transferencia.component';
import { TransferenciaListaComponent } from './transferenciaLista/transferenciaLista.component';
import { TransferenciaListaDetallesComponent } from './transferenciaListaDetalles/transferenciaListaDetalles.component';
import { GrupoDescuentoComponent } from './grupoDescuento/grupoDescuento.component';
import { FormGrupoDescuentoComponent } from './formularios/form-grupoDescuento.component';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { AbiProductosComponent } from './abi-productos/abi-productos.component';
import { AbiFormProductosComponent } from './abi-productos/abi-form-productos.component';
import { ABIPreciosComponent } from './abi-precios/abi-precios.component';
import { ABIStockComponent } from './abi-stock/abi-stock.component';
import { ABIPuntoRetiroComponent } from './abi-puntoRetiro/abi-puntoRetiro.component';
import { FormABIPuntoRetiroComponent } from './abi-puntoRetiro/form-abi-puntoRetiro.component';
import { BonificacionesComponent } from './bonificacion/bonificaciones.component';
import { FormBonificacionComponent } from './formularios/form-bonificaciones.component';
import { GrupoMaterialComponent } from './grupoMaterial/grupoMaterial.component';
import { FormGrupoMaterialComponent } from './formularios/form-grupoMaterial.component';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { FormPuntosComponent } from './formularios/form-punto.component';
import { PuntosComponent } from './puntos/puntos.component';
import { FormPremioComponent } from './formularios/form-premio.component';
import { PremiosComponent } from './premios/premios.component';
import { CanjesComponent } from './canjes/canjes.component';
import { CanjeListaComponent } from './canjeLista/canjeLista.component';
import { CanjeListaDetallesComponent } from './canjeListaDetalle/canjeListaDetalle.component';
import { HistorialPuntosComponent } from './historialPuntos/historialPuntos.component';
import { AlianzasComponent } from './alianzas/alianzas.component';
import { CuponesComponent } from './cupones/cupones.component';
import { NgxBarcode6Module } from 'ngx-barcode6';
import { RouterModule } from '@angular/router';
import { InfluencerComponent } from './influencers/influencers.component';
import { StockPremioComponent } from './stockPremio/stockPremio.component';
import { HistorialPremiosComponent } from './historialPremios/historialPremios.component';
import { MvnStockPremioDocs } from './stockPremioPage/mvStockPremioDocs/mvStockPremioDocs.component';
import { MvStockPremioComponent } from './stockPremioPage/mvStockPremio/mvStockPremio.component';
import { RepartoDocsComponent } from './reparto/repartoDocs.component';
import { CreditosComponent } from './creditos/creditos.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};

@NgModule({
  declarations: [
    HistorialPuntosComponent,
    CanjesComponent,
    CanjeListaComponent,
    CanjeListaDetallesComponent,
    PremiosComponent,
    FormPremioComponent,
    FormPuntosComponent,
    PuntosComponent,
    VendedoresReporteComponent,
    VendedoresComponent,
    FormVendedoresComponent,
    RepartoListaComponent,
    RepartoComponent,
    VTicketComponent,
    VehiculosComponent,
    ClientesComponent,
    ChoferComponent,
    DashboardComponent,
    PagesComponent,
    UnidadMedidaComponent,
    CategoriaComponent,
    MedioPagoComponent,
    BancosComponent,
    ABIPuntoRetiroComponent,
    DepositosComponent,
    SucursalesComponent,
    AccoutSettingsComponent,
    UsuariosComponent,
    EmpresasComponent,
    VentasComponent,
    PedidosComponent,
    TipoMedioPagoComponent,
    TerminalesComponent,
    TicketVentaComponent,
    ComprobanteComponent,
    VentasListaComponent,
    VentasListaDetallesComponent,
    PedidoListaComponent,
    ProductosComponent,
    AbiProductosComponent,
    PreciosComponent,
    PreciosMaterialesComponent,
    FormPreciosMaterialesComponent,
    StockComponent,
    StockPremioComponent,
    TipoDepositoComponent,
    PedidoListaDetallesComponent,
    TicketComponent,
    MotivoAnulacionComponent,
    ListaPrecioComponent,
    GrupoMaterialComponent,
    DescuentosComponent,
    BonificacionesComponent,
    Ticket80Component,
    CobranzaListaComponent,
    CreditosComponent,
    FormVehiculosComponent,
    FormTipoDepositoComponent,
    FormStockComponent,
    FormDepositoComponent,
    FormTerminalesComponent,
    FormClientesComponent,
    FormChoferComponent,
    FormSucursalesComponent,
    FormABIPuntoRetiroComponent,
    FormDescuentosComponent,
    FormBonificacionComponent,
    FormProductosComponent,
    AbiFormProductosComponent,
    FormUnidadMedidaComponent,
    FormCategoriaComponent,
    FormComprobantesComponent,
    FormPreciosComponent,
    FormUsuarioComponent,
    FormTipoMedioPagoComponent,
    FormMedioPagoComponent,
    FormaVentaComponent,
    FormFormaVentaComponent,
    FormBancosComponent,
    FormListaPrecioComponent,
    FormGrupoMaterialComponent,
    FormMotivoAnulacionComponent,
    CambioPreciosComponent,
    CambioPreciosCostoComponent,
    ObsequiosComponent,
    ComprasComponent,
    ComprasListaComponent,
    CompraListaDetallesComponent,
    ProveedoresComponent,
    FormProveedorComponent,
    FormMotivoAnulacionCompraComponent,
    FormMotivoTransferenciaComponent,
    MotivoTransferenciaComponent,
    MotivoAnulacionCompraComponent,
    TransferenciaComponent,
    TransferenciaListaComponent,
    TransferenciaListaDetallesComponent,
    GrupoDescuentoComponent,
    FormGrupoDescuentoComponent,
    ABIPreciosComponent,
    ABIStockComponent,
    AlianzasComponent,
    CuponesComponent,
    InfluencerComponent,
    RepartoDocsComponent,
    HistorialPremiosComponent,
    MvnStockPremioDocs,
    MvStockPremioComponent
  ],
  exports: [
    DashboardComponent,
    PagesComponent],
  imports: [
    CommonModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBW0MsACjPZnIGaG9IHnYBXXb9KjVpQIvE'
    }),
    AgmSnazzyInfoWindowModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    ComponentsModule,
    TextMaskModule,
    NgSelectModule,
    RouterModule,
    NgOptionHighlightModule,
    NgbPaginationModule,
    NgbModule,
    NgbAlertModule,
    NgxPrintModule,
    PerfectScrollbarModule,
    NgxQRCodeModule,
    NgxBarcode6Module,

  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }]
})
export class PagesModule { }
