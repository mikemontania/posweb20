import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { VentasService } from '../../services/ventas/ventas.service';
import { Venta } from '../../models/venta.model';
import { VentaDetalle } from '../../models/VentaDetalle.model';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { Cobranza } from '../../models/cobranza.model';
import { Descuento } from '../../models/descuento.model';
import { DescuentoService, EmpresasService } from '../../services/service.index';
import { Empresas } from '../../models/empresas.model';
import { Sucursal } from '../../models/sucursal.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { Cliente } from '../../models/cliente.model';
 
@Component({
  selector: 'app-ticket',
  templateUrl: './v-ticket.html',
  styleUrls: ['./v-ticket.css']
 })

export class VTicketComponent implements OnInit {
  Cliente: Cliente;
  listo: boolean = false;
  razonSocial: string;
  sucursal: Sucursal;
  empresa: Empresas;
  cargando2: boolean = true;
  cargando: boolean = false;
  descuento: boolean = false;
  formaContadoFalse: boolean;
  venta: Venta;
  cobranza: Cobranza;
  detalles: VentaDetalle [] = [];
  descuentos: Descuento [] = [];
  cobranzaDetalles: CobranzaDetalle [] = [];
  ventas: Venta[] = [];
  paginador: any;
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  rutaPaginador: string = '/ventasLista/page';
  constructor( public _empresasService: EmpresasService, public _sucursalService: SucursalesService,
    private _ventasService: VentasService,
    private activatedRoute: ActivatedRoute,
    private _descuentoService: DescuentoService,
    public router: Router,
    public http: HttpClient
  ) { }

  ngOnInit() {
   this.listo = false;
    this.descuento = false;
    console.log('listas');
     this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._ventasService.traerVentaPorID(id)
        .subscribe((response: any) => {
          if (response.venta) {
            console.log('res', response );
           this.venta = response.venta;
           this.Cliente = this.venta.cliente;
           this.detalles = this.venta.detalle;
           console.log('Venta',this.venta);
           this._empresasService.traerEmpresasPorId(this.venta.codEmpresa).subscribe((resp: any) => {
              console.log('respuesta', resp);
              this.empresa = resp;
              this._sucursalService.getSucursalbyId(this.venta.codSucursal).subscribe((suc: any) => {
              this.sucursal = suc;
              this.listo = true;
              });
            });
          }
        });
      }

    });
  }
  print() {}

}
