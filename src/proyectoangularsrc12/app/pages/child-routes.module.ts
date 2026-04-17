import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { AccoutSettingsComponent } from './accout-settings/accout-settings.component';

import { UsuariosComponent } from './usuarios/usuarios.component';
import { EmpresasComponent } from './empresas/empresas.component';
import { VentasComponent } from './ventas/ventas.component';
import { ProductosComponent } from './productos/productos.component';
import { FormClientesComponent } from './formularios/form-clientes.component';

import { DescuentosComponent } from './descuentos/descuentos.component';
import { PreciosComponent } from './precios/precios.component';
import { ClientesComponent } from './clientes/clientes.component';
import { FormDescuentosComponent } from './formularios/form-descuentos.component';
import { FormProductosComponent } from './formularios/form-productos.component';
import { FormPreciosComponent } from './formularios/form-precios.component';
import { VerificaTokenGuard } from '../services/guards/verifica-token.guard';
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
import { FormComprobantesComponent } from './formularios/form-comprobantes.component';
import { BancosComponent } from './bancos/bancos.component';
import { FormBancosComponent } from './formularios/form-bancos.component';
import { TipoMedioPagoComponent } from './tipoMedioPago/tipoMedioPago.component';
import { FormTipoMedioPagoComponent } from './formularios/form-tipoMedioPago.component';
import { FormaVentaComponent } from './formaVenta/formaVenta.component';
import { FormFormaVentaComponent } from './formularios/form-formaVenta.component';
import { TicketComponent } from './ticket/ticket';
import { Ticket80Component } from './ticket80/ticket80';
import { TicketVentaComponent } from './ticketVenta/ticketVenta';
import { ListaPrecioComponent } from './listaPrecio/listaPrecio.component';
import { FormListaPrecioComponent } from './formularios/form-listaPrecio.component';
import { MotivoAnulacionComponent } from './motivoAnulacion/motivoAnulacion.component';
import { FormMotivoAnulacionComponent } from './formularios/form-motivoAnulacion.component';
import { VTicketComponent } from './v-ticket/v-ticket';
import { CobranzaListaComponent } from './cobranzaLista/cobranzaLista.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { PedidoListaComponent } from './pedidoLista/pedidoLista.component';
import { DepositosComponent } from './depositos/depositos.component';
import { FormDepositoComponent } from './formularios/form-deposito.component';
import { StockComponent } from './stock/stock.component';
import { FormStockComponent } from './formularios/form-stock.component';
import { TipoDepositoComponent } from './tipoDeposito/tipoDeposito.component';
import { FormTipoDepositoComponent } from './formularios/form-tipoDeposito.component';
import { PedidoListaDetallesComponent } from './pedidoListaDetalles/pedidoListaDetalles.component';
import { CambioPreciosComponent } from './importar/cambio-precios.component';
import { ObsequiosComponent } from './obsequios/obsequios.component';
import { PreciosMaterialesComponent } from './preciosMateriales/preciosMateriales.component';
import { FormPreciosMaterialesComponent } from './formularios/form-preciosMateriales.component';
import { ChoferComponent } from './choferes/choferes.component';
import { FormChoferComponent } from './formularios/form-choferes.component';
import { VehiculosComponent } from './vehiculos/vehiculos.component';
import { FormVehiculosComponent } from './formularios/form-vehiculos.component';
import { RepartoComponent } from './reparto/reparto.component';
import { RepartoListaComponent } from './reparto/repartoLista.component';
import { VendedoresComponent } from './vendedores/vendedores.component';
import { FormVendedoresComponent } from './formularios/form-vendedores.component';
import { VendedoresReporteComponent } from './vendedoresReporte/vendedoresReporte.component';
import { CambioPreciosCostoComponent } from './importar/cambio-preciosCosto.component';
import { ComprasComponent } from './compras/compras.component';
import { ComprasListaComponent } from './comprasLista/comprasLista.component';
import { CompraListaDetallesComponent } from './compraListaDetalles/compraListaDetalles.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { FormProveedorComponent } from './formularios/form-proveedor.component';
import { FormMotivoAnulacionCompraComponent } from './formularios/form-motivoAnulacionCompra.component';
import { FormMotivoTransferenciaComponent } from './formularios/form-motivoTranferencia.component';
import { MotivoTransferenciaComponent } from './motivoTransferencia/motivoTransferencia.component';
import { MotivoAnulacionCompraComponent } from './motivoAnulacionCompra/motivoAnulacionCompra.component';
import { TransferenciaComponent } from './transferencia/transferencia.component';
import { TransferenciaListaComponent } from './transferenciaLista/transferenciaLista.component';
import { TransferenciaListaDetallesComponent } from './transferenciaListaDetalles/transferenciaListaDetalles.component';
import { FormGrupoDescuentoComponent } from './formularios/form-grupoDescuento.component';
import { GrupoDescuentoComponent } from './grupoDescuento/grupoDescuento.component';
import { AbiFormProductosComponent } from './abi-productos/abi-form-productos.component';
import { AbiProductosComponent } from './abi-productos/abi-productos.component';
import { ABIPreciosComponent } from './abi-precios/abi-precios.component';
import { ABIStockComponent } from './abi-stock/abi-stock.component';
import { ABIPuntoRetiroComponent } from './abi-puntoRetiro/abi-puntoRetiro.component';
import { FormABIPuntoRetiroComponent } from './abi-puntoRetiro/form-abi-puntoRetiro.component';
import { BonificacionesComponent } from './bonificacion/bonificaciones.component';
import { FormBonificacionComponent } from './formularios/form-bonificaciones.component';
import { GrupoMaterialComponent } from './grupoMaterial/grupoMaterial.component';
import { FormGrupoMaterialComponent } from './formularios/form-grupoMaterial.component';
import { FormPuntosComponent } from './formularios/form-punto.component';
import { PuntosComponent } from './puntos/puntos.component';
import { FormPremioComponent } from './formularios/form-premio.component';
import { PremiosComponent } from './premios/premios.component';
import { CanjesComponent } from './canjes/canjes.component';
import { CanjeListaDetallesComponent } from './canjeListaDetalle/canjeListaDetalle.component';
import { CanjeListaComponent } from './canjeLista/canjeLista.component';
import { HistorialPuntosComponent } from './historialPuntos/historialPuntos.component';
import { AlianzasComponent } from './alianzas/alianzas.component';
import { CuponesComponent } from './cupones/cupones.component';
import { NgModule } from '@angular/core';
import { InfluencerComponent } from './influencers/influencers.component';
import { StockPremioComponent } from './stockPremio/stockPremio.component';
import { HistorialPremiosComponent } from './historialPremios/historialPremios.component';
import { MvStockPremioComponent } from './stockPremioPage/mvStockPremio/mvStockPremio.component';
import { MvnStockPremioDocs } from './stockPremioPage/mvStockPremioDocs/mvStockPremioDocs.component';
import { RepartoDocsComponent } from './reparto/repartoDocs.component';
import { CreditosComponent } from './creditos/creditos.component';


const childRoutes: Routes = [
    { path: '', component: DashboardComponent, canActivate: [VerificaTokenGuard], data: { titulo: 'Dashboard' } },
    { path: 'dashboard', component: DashboardComponent, canActivate: [VerificaTokenGuard], data: { titulo: 'Dashboard' } },
  {
    path: 'historialPuntos/page/:page',
    component: HistorialPuntosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'historialPuntos' }
},
 {
    path: 'historialPuntos',
    component: HistorialPuntosComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'historialPuntos' }
},
{
    path: 'empresas',
    component: EmpresasComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'Empresas' }
},
{
    path: 'compras',
    component: ComprasComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Compras' }
},
{
  path: 'mvstockpremio',
  component: MvStockPremioComponent,
  canActivate: [VerificaTokenGuard],
  data:
      { titulo: 'mvstockpremio' }
},
{
    path: 'transferencias',
    component: TransferenciaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Transferencias' }
},
{
    path: 'ventas',
    component: VentasComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Ventas' }
},
{
    path: 'ventas/page/:page',
    component: VentasComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Ventas' }
},

{
    path: 'obsequios',
    component: ObsequiosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Obsequios' }
},
{
    path: 'obsequios/page/:page',
    component: ObsequiosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Obsequios' }
},
{
    path: 'pedidos',
    component: PedidosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Pedidos' }
},
{
    path: 'pedidos/page/:page',
    component: PedidosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Pedidos' }
},



{
    path: 'canjes',
    component: CanjesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Canjes' }
},
{
    path: 'canjes/page/:page',
    component: CanjesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Canjes' }
},

{
    path: 'account-settings',
    component: AccoutSettingsComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'Ajustes de Tema' }
},

// Mantenimiento
{
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Usuarios' }
},
{
    path: 'usuarios/page/:page',
    component: UsuariosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'usuarios' }
},
{
    path: 'precios',
    component: PreciosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Precios' }
},
{
    path: 'precios/page/:page',
    component: PreciosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Precios' }
},
{
    path: 'historialPremios',
    component: HistorialPremiosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Precios' }
},
{
    path: 'historialPremios/page/:page',
    component: HistorialPremiosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Precios' }
},
{
    path: 'precios/formulario',
    component: FormPreciosComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'Precios Formulario' }
},
{
    path: 'precios/formulario/:id',
    component: FormPreciosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Precios Formulario' }
},
{
    path: 'precios/importar',
    component: CambioPreciosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Importar precio' }
},
{
    path: 'precioscosto/importar',
    component: CambioPreciosCostoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Importar precio costo' }
},
{
    path: 'clientes',
    component: ClientesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Clientes' }
},
{
    path: 'clientes/page/:page',
    component: ClientesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Clientes' }
},
{
    path: 'proveedores',
    component: ProveedoresComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Proveedores' }
},
{
    path: 'proveedores/page/:page',
    component: ProveedoresComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Proveedores' }
},

{
    path: 'proveedores/formulario',
    component: FormProveedorComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'proveedores Formulario' }
},
{
    path: 'proveedores/formulario/:id',
    component: FormProveedorComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'proveedores Formulario' }
},

{
    path: 'vendedores',
    component: VendedoresComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Clientes' }
},
{
    path: 'vendedores/page/:page',
    component: VendedoresComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Clientes' }
},

{
    path: 'choferes',
    component: ChoferComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Choferes' }
},
{
    path: 'choferes/page/:page',
    component: ChoferComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Choferes' }
},
{
    path: 'terminales/formulario',
    component: FormTerminalesComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'terminales' }
},
{
    path: 'terminales/formulario/:id',
    component: FormTerminalesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'terminales' }
},
{
    path: 'medioPago/formulario',
    component: FormMedioPagoComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'medioPago' }
},
{
    path: 'medioPago/formulario/:id',
    component: FormMedioPagoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'medioPago' }
},
{
    path: 'comprobantes/formulario',
    component: FormComprobantesComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'comprobantes' }
},
{
    path: 'comprobantes/formulario/:id',
    component: FormComprobantesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'comprobantes' }
},
{
    path: 'abi-puntosRetiro',
    component: ABIPuntoRetiroComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'puntosRetiro' }
},
{
    path: 'abi-puntosRetiro/page/:page',
    component: ABIPuntoRetiroComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'puntosRetiro' }
},
{
    path: 'bancos',
    component: BancosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'bancos' }
},
{
    path: 'bancos/page/:page',
    component: BancosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'bancos' }
},
{
    path: 'alianzas',
    component: AlianzasComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'alianzas' }
},
{
    path: 'alianzas/page/:page',
    component: AlianzasComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'alianzas' }
},
{
    path: 'vehiculos',
    component: VehiculosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Vehiculos' }
},
{
    path: 'vehiculos/page/:page',
    component: VehiculosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Vehiculos' }
},
{
    path: 'bancos/formulario',
    component: FormBancosComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'bancos' }
},
{
    path: 'bancos/formulario/:id',
    component: FormBancosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'bancos' }
},
{
    path: 'vehiculos/formulario',
    component: FormVehiculosComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'vehiculos formulario' }
},
{
    path: 'vehiculos/formulario/:id',
    component: FormVehiculosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'vehiculo formulario' }
},
{
    path: 'grupoMaterial',
    component: GrupoMaterialComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Grupo Material' }
},
{
    path: 'grupoMaterial/page/:page',
    component: GrupoMaterialComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Grupo Material' }
},   {
    path: 'grupoMaterial/formulario',
    component: FormGrupoMaterialComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'Grupo Material' }
},
{
    path: 'grupoMaterial/formulario/:id',
    component: FormGrupoMaterialComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Grupo Material' }
},
{
    path: 'comprobantes',
    component: ComprobanteComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'comprobantes' }
},
{
    path: 'comprobantes/page/:page',
    component: ComprobanteComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'comprobantes' }
},
{
    path: 'listaPrecio',
    component: ListaPrecioComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'listaPrecio' }
},
{
    path: 'listaPrecio/page/:page',
    component: ListaPrecioComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'listaPrecio' }
},
{
    path: 'listaPrecio/formulario',
    component: FormListaPrecioComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'listaPrecio' }
},
{
    path: 'listaPrecio/formulario/:id',
    component: FormListaPrecioComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'listaPrecio' }
},
{
    path: 'categoria/formulario',
    component: FormCategoriaComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'categoria' }
},
{
    path: 'categoria/formulario/:id',
    component: FormCategoriaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'categoria' }
},
{
    path: 'sucursales',
    component: SucursalesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Sucursales' }
},
{
    path: 'sucursales/page/:page',
    component: SucursalesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Sucursales' }
},
{
    path: 'sucursales/formulario',
    component: FormSucursalesComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'sucursales' }
},
{
    path: 'sucursales/formulario/:id',
    component: FormSucursalesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'sucursales' }
},
{
    path: 'influencers',
    component: InfluencerComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'influencers' }
},
{
    path: 'influencers/page/:page',
    component: InfluencerComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'influencers' }
},
{
    path: 'abi-puntoRetiro/formulario',
    component: FormABIPuntoRetiroComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'puntoRetiro' }
},
{
    path: 'abi-puntoRetiro/formulario/:id',
    component: FormABIPuntoRetiroComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'puntoRetiro' }
},
{
    path: 'preciosMateriales',
    component: PreciosMaterialesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'preciosMateriales' }
},
{
    path: 'preciosMateriales/page/:page',
    component: PreciosMaterialesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'preciosMateriales' }
},
{
    path: 'preciosMateriales/formulario',
    component: FormPreciosMaterialesComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'preciosMateriales Formulario' }
},
{
    path: 'preciosMateriales/formulario/:id',
    component: FormPreciosMaterialesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'preciosMateriales Formulario' }
},
{
    path: 'unidadMedida/formulario',
    component: FormUnidadMedidaComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'unidadMedida' }
},
{
    path: 'unidadMedida/formulario/:id',
    component: FormUnidadMedidaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'unidadMedida' }
},
{
    path: 'tipoMedioPago/formulario',
    component: FormTipoMedioPagoComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'tipoMedioPago' }
},
{
    path: 'tipoMedioPago/formulario/:id',
    component: FormTipoMedioPagoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'tipoMedioPago' }
},
{
    path: 'terminales',
    component: TerminalesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'terminales' }
},
{
    path: 'terminales/page/:page',
    component: TerminalesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'terminales' }
},
{
    path: 'categoria',
    component: CategoriaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'categoria' }
},
{
    path: 'categoria/page/:page',
    component: CategoriaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'categoria' }
},
{
    path: 'unidadMedida',
    component: UnidadMedidaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'unidadMedida' }
},
{
    path: 'unidadMedida/page/:page',
    component: UnidadMedidaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'unidadMedida' }
},
{
    path: 'clientes/formulario',
    component: FormClientesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Clientes Formulario' }
},
{
    path: 'clientes/formulario/:id',
    component: FormClientesComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'Clientes Formulario' }
},
{
    path: 'vendedores/formulario',
    component: FormVendedoresComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Formulario vendedor' }
},
{
    path: 'vendedores/formulario/:id',
    component: FormVendedoresComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'Formulario vendedor' }
},
{
    path: 'choferes/formulario',
    component: FormChoferComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Choferes Formulario' }
},
{
    path: 'choferes/formulario/:id',
    component: FormChoferComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'Choferes Formulario' }
},
{
    path: 'medioPago',
    component: MedioPagoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'medioPago' }
},
{
    path: 'medioPago/page/:page',
    component: MedioPagoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'medioPago' }
},
{
    path: 'grupoDescuento',
    component: GrupoDescuentoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'grupoDescuento' }
},
{
    path: 'grupoDescuento/page/:page',
    component: GrupoDescuentoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'grupoDescuento' }
},
{
    path: 'grupoDescuento/formulario',
    component: FormGrupoDescuentoComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'grupoDescuento' }
},
{
    path: 'grupoDescuento/formulario/:id',
    component: FormGrupoDescuentoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'grupoDescuento' }
},
{
    path: 'formaVenta',
    component: FormaVentaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'formaVenta' }
},
{
    path: 'formaVenta/page/:page',
    component: FormaVentaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'formaVenta' }
},
{
    path: 'formaVenta/formulario',
    component: FormFormaVentaComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'formaVenta' }
},
{
    path: 'formaVenta/formulario/:id',
    component: FormFormaVentaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'formaVenta' }
},
{
    path: 'bonificaciones',
    component: BonificacionesComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'Bonificaciones' }
},
{
    path: 'bonificaciones/page/:page',
    component: BonificacionesComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'Bonificaciones' }
},
{
    path: 'descuentos',
    component: DescuentosComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'Descuentos' }
},
{
    path: 'descuentos/page/:page',
    component: DescuentosComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'Descuentos' }
},
{
    path: 'cupones',
    component: CuponesComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'cupones' }
},
{
    path: 'cupones/page/:page',
    component: CuponesComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'cupones' }
},
{
    path: 'bonificaciones/formulario',
    component: FormBonificacionComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'bonificaciones Formulario' }
},
{
    path: 'bonificaciones/formulario/:id',
    component: FormBonificacionComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'bonificaciones Formulario' }
},
{
    path: 'descuentos/formulario',
    component: FormDescuentosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Descuentos Formulario' }
},
{
    path: 'descuentos/formulario/:id',
    component: FormDescuentosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Descuentos Formulario' }
},
{
    path: 'puntos',
    component: PuntosComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'Descuentos' }
},
{
    path: 'puntos/page/:page',
    component: PuntosComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'Descuentos' }
},
{
    path: 'premios',
    component: PremiosComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'Descuentos' }
},
{
    path: 'premios/page/:page',
    component: PremiosComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'Descuentos' }
},
{
    path: 'premios/formulario',
    component: FormPremioComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Descuentos Formulario' }
},
{
    path: 'premios/formulario/:id',
    component: FormPremioComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Descuentos Formulario' }
},
{
    path: 'puntos/formulario',
    component: FormPuntosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Descuentos Formulario' }
},
{
    path: 'puntos/formulario/:id',
    component: FormPuntosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Descuentos Formulario' }
},
{
    path: 'productos',
    component: ProductosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Productos' }
},
{
    path: 'productos/page/:page',
    component: ProductosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Productos' }
},
{
    path: 'abi-productos',
    component: AbiProductosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Productos' }
},
{
    path: 'abi-productos/page/:page',
    component: AbiProductosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Productos' }
},
{
    path: 'ventasLista',
    component: VentasListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Ventas' }
},
{
    path: 'ventasLista/id/:id',
    component: VentasListaDetallesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Ventas' }
},
{
    path: 'ventasLista/page/:page',
    component: VentasListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Ventas' }
},
{
    path: 'comprasLista',
    component: ComprasListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Compras' }
},
{
  path: 'mvstockpremiolst',
  component: MvnStockPremioDocs,
  canActivate: [VerificaTokenGuard],
  data:
      { titulo: 'Compras' }
},
{
  path: 'mvstockpremiolst/page/:page',
  component: MvnStockPremioDocs,
  canActivate: [VerificaTokenGuard],
  data:
      { titulo: 'Compras' }
},
{
    path: 'transferenciaLista',
    component: TransferenciaListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'transferencias' }
},
{
    path: 'transferenciaLista/page/:page',
    component: TransferenciaListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'transferencias' }
},
{
    path: 'comprasLista/page/:page',
    component: ComprasListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Compras' }
},
{
    path: 'comprasLista/id/:id',
    component: CompraListaDetallesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'compras' }
},
{
    path: 'transferenciaLista/id/:id',
    component: TransferenciaListaDetallesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'transferencias' }
},
{
    path: 'repartos',
    component: RepartoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'repartos' }
},
{
    path: 'repartos/id/:id',
    component: RepartoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'repartos' }
},
{
  path: 'repartosDocs/:codReparto/:codSucursal',
  component: RepartoDocsComponent,
  canActivate: [VerificaTokenGuard],
  data:
      { titulo: 'docs' }
},
{
    path: 'repartosView/code/:code',
    component: RepartoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'repartos' }
},
{
    path: 'listaReparto/page/:page',
    component: RepartoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'repartos' }
},
{
    path: 'listaReparto',
    component: RepartoListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Cobranza' }
},
{
    path: 'listaReparto/id/:id',
    component: RepartoListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Cobranza' }
},

{
    path: 'reporteVendedores',
    component: VendedoresReporteComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Reporte de vendedores' }
},
{
    path: 'reporteVendedores/id/:id',
    component: VendedoresReporteComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Reporte de vendedores' }
},
{
    path: 'reporteVendedores/page/:page',
    component: VendedoresReporteComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Reporte de vendedores' }
},
{
    path: 'cobranzaLista',
    component: CobranzaListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Cobranza' }
},
{
    path: 'cobranzaLista/id/:id',
    component: CobranzaListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Cobranza' }
},
{
  path: 'cobranzaLista/page/:page',
  component: CobranzaListaComponent,
  canActivate: [VerificaTokenGuard],
  data:
      { titulo: 'Creditos' }
},
{
  path: 'creditos',
  component: CreditosComponent,
  canActivate: [VerificaTokenGuard],
  data:
      { titulo: 'Creditos' }
},
{
  path: 'creditos/id/:id',
  component: CreditosComponent,
  canActivate: [VerificaTokenGuard],
  data:
      { titulo: 'Creditos' }
},
{
    path: 'creditos/page/:page',
    component: CreditosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Creditos' }
},
{
    path: 'productos/formulario',
    component: FormProductosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Productos Formulario' }
},
{
    path: 'productos/formulario/:id',
    component: FormProductosComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'Productos Formulario' }
},
{
    path: 'abi-precios',
    component: ABIPreciosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Precios Abi' }
},
{
    path: 'abi-stock',
    component: ABIStockComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Stock Abi' }
},
{
    path: 'abi-productos/formulario',
    component: AbiFormProductosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Productos Formulario' }
},
{
    path: 'abi-productos/formulario/:id',
    component: AbiFormProductosComponent,
    canActivate: [VerificaTokenGuard],

    data:
        { titulo: 'Productos Formulario' }
},
{
    path: 'usuarios/formulario',
    component: FormUsuarioComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Usuarios Formulario' }
},
{
    path: 'usuarios/formulario/:id',
    component: FormUsuarioComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Usuarios Formulario' }
},
{
    path: 'tipoMedioPago',
    component: TipoMedioPagoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'tipoMedioPago' }
},
{
    path: 'tipoMedioPago/page/:page',
    component: TipoMedioPagoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'tipoMedioPago' }
},

{
    path: 'ticket/id/:id',
    component: TicketComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'ticket' }
},
{
    path: 'ticket80/id/:id',
    component: Ticket80Component,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'ticket80' }
},
{
    path: 'v-ticket/id/:id',
    component: VTicketComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'vticket' }
},
{
    path: 'ticketVenta/id/:id',
    component: TicketVentaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'ticketVenta' }
},
{
    path: 'motivoAnulacion',
    component: MotivoAnulacionComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'motivoAnulacion' }
},
{
    path: 'motivoAnulacion/page/:page',
    component: MotivoAnulacionComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'motivoAnulacion' }
},
{
    path: 'motivoTransferencia',
    component: MotivoTransferenciaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'motivoTransferencia' }
},
{
    path: 'motivoTransferencia/page/:page',
    component: MotivoTransferenciaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'motivoTransferencia' }
},
{
    path: 'motivoAnulacionCompra',
    component: MotivoAnulacionCompraComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'motivo anulacion compra' }
},
{
    path: 'motivoAnulacionCompra/page/:page',
    component: MotivoAnulacionCompraComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'motivo anulacion compra' }
},
{
    path: 'motivoAnulacion/formulario',
    component: FormMotivoAnulacionComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'motivoAnulacion' }
},
{
    path: 'motivoAnulacion/formulario/:id',
    component: FormMotivoAnulacionComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'motivoAnulacion' }
},

{
    path: 'motivoAnulacionCompra/formulario',
    component: FormMotivoAnulacionCompraComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'motivoAnulacionCompra' }
},
{
    path: 'motivoAnulacionCompra/formulario/:id',
    component: FormMotivoAnulacionCompraComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'motivoAnulacionCompra' }
},

{
    path: 'motivoTransferencia/formulario',
    component: FormMotivoTransferenciaComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'motivotranferencia' }
},
{
    path: 'motivoTransferencia/formulario/:id',
    component: FormMotivoTransferenciaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'motivotranferencia' }
},
{
    path: 'pedidoLista',
    component: PedidoListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Lista pedidos' }
},
{
    path: 'pedidoLista/id/:id',
    component: PedidoListaDetallesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Lista pedidos' }
},
{
    path: 'pedidoLista/page/:page',
    component: PedidoListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Lista pedidos' }
},

{
    path: 'canjeLista',
    component: CanjeListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Lista canjes' }
},
{
    path: 'canjeLista/id/:id',
    component: CanjeListaDetallesComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Lista pedidos' }
},
{
    path: 'canjeLista/page/:page',
    component: CanjeListaComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Lista canjes' }
},
{
    path: 'depositos',
    component: DepositosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Depositos' }
},
{
    path: 'depositos/page/:page',
    component: DepositosComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Depositos' }
},
{
    path: 'depositos/formulario',
    component: FormDepositoComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'Depositos' }
},
{
    path: 'depositos/formulario/:id',
    component: FormDepositoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Depositos' }
},
{
    path: 'stockPremio',
    component: StockPremioComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Stock Premio' }
},
{
    path: 'stockPremio/page/:page',
    component: StockPremioComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Stock Premio' }
},
{
    path: 'stock',
    component: StockComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Stock' }
},
{
    path: 'stock/page/:page',
    component: StockComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Stock' }
},
{
    path: 'stock/formulario',
    component: FormStockComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'Stock' }
},
{
    path: 'stock/formulario/:id',
    component: FormStockComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Stock' }
},

{
    path: 'tipoDeposito',
    component: TipoDepositoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Tipo Deposito' }
},
{
    path: 'tipoDeposito/page/:page',
    component: TipoDepositoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Tipo Deposito' }
},
{
    path: 'tipoDeposito/formulario',
    component: FormTipoDepositoComponent,
    canActivate: [VerificaTokenGuard],
    data: { titulo: 'Tipo Deposito' }
},
{
    path: 'tipoDeposito/formulario/:id',
    component: FormTipoDepositoComponent,
    canActivate: [VerificaTokenGuard],
    data:
        { titulo: 'Tipo Deposito' }
}
]

@NgModule({
  imports: [ RouterModule.forChild(childRoutes) ],
  exports: [ RouterModule ]
})
export class ChildRoutesModule { }
