import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { PipesModule } from '../pipes/pipes.module';
import { NGSelectDepositoComponent } from './ng-select-deposito/ng-select-deposito.component';
import { NGSelectUsuarioComponent } from './ng-select-usuario/ng-select-usuario.component';
import { NGSelectClienteComponent } from './ng-select-cliente/ng-select-cliente.component';
import { NGSelectMedioPagoComponent } from './ng-select-medioPago/ng-select-medioPago.component';
import { THUsuarioComponent } from './thusuario/thusuario.component';
import { THProductoComponent } from './thproducto/thproducto.component';
import { NgbdTypeaheadClientes } from './typeahead-clientes/typeahead-clientes';
import { THClienteComponent } from './thcliente/thcliente.component';
import { THSucursalComponent } from './thsucursal/thsucursal.component';
import { NGSelectSucursalComponent } from './ng-select-sucursal/ng-select-sucursal.component';
import { SelectThClienteComponent } from './select-th-cliente/select-th-cliente';
import { NgbdTypeaheadHttp } from './typeahead-http/typeahead-http';
import { NGSelectProductoComponent } from './ng-select-producto/ng-select-producto.component';
import { NgbdTypeaheadConfig } from './typeahead-config/typeahead-config';
import { NGSelectUnidadComponent } from './ng-select-unidad/ng-select-unidad.component';
import { IncrementadorComponent } from './incrementador/incrementador.component';
import { DashFiltroComponent } from './dashFiltro/dashFiltro.component';
import { NgbdTypeaheadProductos } from './typeahead-productos/typeahead-productos';
import { InputDebounceComponent } from './inputDebounce/inputDebounce.component';
import { SearchComponent } from './search/search';
import { FormClienteComponent } from './form-cliente/form-cliente.component';
import { NgbdTypeaheadTemplate } from './typeahead-template/typeahead-template';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';
import { NgbModule, NgbPaginationModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NGXBarraHorizontalComponent } from './ngx-charts-barra-horizontal/ngx-charts-barra-horizontal.component';
import { NgxBarraVerticalComponent } from './ngx-charts-barra-vertical/ngx-charts-barra-vertical.component';
import { ChartDashTopProductoComponent } from './chartDashTopProductos/chartDashTopProductos.component';
import { NGXPieComponent } from './ngx-charts-pie/ngx-charts-pie.component';
import { ChartDashResumenMedioPago } from './chartDashResumen-mediopago/chartDashResumen-mediopago.component';
import { ChartDashResumenSucursalComponent } from './chartDashResumen-sucursal/chartDashResumen-sucursal.component';
import { ChartDashResumenUsuarioComponent } from './chartdashResumen-usuario/chartdashResumen-usuario.component';
import { ChartDashTopClienteComponent } from './chartDashTopClientes/chartDashTopClientes.component';
import { NGXPieAdvancedComponent } from './ngx-pie-chart-advanced/ngx-pie-chart-advanced.component';
import { NGXPieGridComponent } from './ngx-pie-chart-grid/ngx-pie-chart-grid.component';
import { NGSelectVehiculoComponent } from './ng-select-vehiculo/ng-select-vehiculo.component';
import { NGSelectChoferComponent } from './ng-select-chofer/ng-select-chofer.component';
import { NGSelectVendedorComponent } from './ng-select-vendedor/ng-select-vendedor.component';
import { BarraCategoriaComponent } from './barra-categoria/barra-categoria.component';
import {
  PerfectScrollbarModule, PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG
} from 'ngx-perfect-scrollbar';
import { NGSelectCategoriaComponent } from './ng-select-categoria/ng-select-categoria.component';
import { NGSelectProveedorComponent } from './ng-select-proveedor/ng-select-proveedor.component';
import { NGSelectMotivoTransferenciaComponent } from './ng-select-motivo-transferencia/ng-select-motivo-transferencia.component';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NGSelectPremioComponent } from './ng-select-premio/ng-select-premio.component';
import { ChartDashResumenRepartoComponent } from './chartDashResumen-reparto/chartDashResumen-reparto.component';
import { NGSelectClienteGoogleComponent } from './ng-select-cliente-google/ng-select-cliente-google.component';
import { NroDocumento } from './nro-docu/nro-docu.component';
import { ChartDashResumenCanalComponent } from './chartDashResumen-canal/chartDashResumen-canal.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PipesModule,
    NgxChartsModule,
    ChartsModule,
    NgbModule,
    NgSelectModule,
    NgOptionHighlightModule,
    NgbPaginationModule,
    NgbAlertModule,
    FormsModule,
    ReactiveFormsModule,
    PerfectScrollbarModule,

  ],
  declarations: [
    ChartDashResumenCanalComponent,
    NGSelectVendedorComponent,
    NGSelectVehiculoComponent,
    NGSelectChoferComponent,
    NGSelectDepositoComponent,
    NGSelectUsuarioComponent,
    NGSelectClienteComponent,
    NGSelectMedioPagoComponent,
    THUsuarioComponent,
    THProductoComponent,
    NgbdTypeaheadClientes,
    THClienteComponent,
    THSucursalComponent,
    NGSelectSucursalComponent,
    SelectThClienteComponent,
    NgbdTypeaheadHttp,
    NGSelectProductoComponent,
    NgbdTypeaheadConfig,
    NGSelectUnidadComponent,
    IncrementadorComponent,
    DashFiltroComponent,
    NgbdTypeaheadProductos,
    InputDebounceComponent,
    SearchComponent,
    FormClienteComponent,
    NgbdTypeaheadTemplate,
    NGXBarraHorizontalComponent,
    NgxBarraVerticalComponent,
    ChartDashTopProductoComponent,
    NGXPieComponent,
    ChartDashResumenMedioPago,
    ChartDashResumenSucursalComponent,
    ChartDashResumenUsuarioComponent,
    ChartDashTopClienteComponent,
    NGXPieAdvancedComponent,
    NGXPieGridComponent,
    BarraCategoriaComponent,
    NGSelectCategoriaComponent,
    NGSelectProveedorComponent,
    NGSelectMotivoTransferenciaComponent,
    NGSelectPremioComponent,
    ChartDashResumenRepartoComponent,
    NGSelectClienteGoogleComponent,
    NroDocumento
  ],
  exports: [
    ChartDashResumenCanalComponent,
    NGSelectPremioComponent,
    NGSelectMotivoTransferenciaComponent,
    NGSelectVendedorComponent,
    NGSelectVehiculoComponent,
    NGSelectChoferComponent,
    NGSelectDepositoComponent,
    NGSelectUsuarioComponent,
    NGSelectClienteComponent,
    NGSelectMedioPagoComponent,
    THUsuarioComponent,
    THProductoComponent,
    NgbdTypeaheadClientes,
    THClienteComponent,
    THSucursalComponent,
    NGSelectSucursalComponent,
    SelectThClienteComponent,
    NgbdTypeaheadHttp,
    NGSelectProductoComponent,
    NgbdTypeaheadConfig,
    NGSelectUnidadComponent,
    IncrementadorComponent,
    DashFiltroComponent,
    NgbdTypeaheadProductos,
    InputDebounceComponent,
    SearchComponent,
    FormClienteComponent,
    NgbdTypeaheadTemplate,
    NGXBarraHorizontalComponent,
    NgxBarraVerticalComponent,
    ChartDashTopProductoComponent,
    NGXPieComponent,
    ChartDashResumenMedioPago,
    ChartDashResumenSucursalComponent,
    ChartDashResumenUsuarioComponent,
    ChartDashTopClienteComponent,
    NGXPieAdvancedComponent,
    NGXPieGridComponent,
    BarraCategoriaComponent,
    NGSelectCategoriaComponent,
    NGSelectProveedorComponent
,ChartDashResumenRepartoComponent,
NGSelectClienteGoogleComponent,
NroDocumento
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }]
})
export class ComponentsModule { }
