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
import { FormaVenta } from '../../models/formaVenta.model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-ticketVenta',
  templateUrl: './ticketVenta.html',
  styleUrls: ['./ticketVenta.css']
 })

export class TicketVentaComponent implements OnInit {
  cliente: Cliente;
  listo: boolean = false;
  formaVenta:FormaVenta;
  mostrarForma: Boolean;
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
  tc:number;
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  rutaPaginador: string = '/ventasLista/page';
  constructor( public _empresasService: EmpresasService, public _sucursalService: SucursalesService,
    private _ventasService: VentasService,
    private activatedRoute: ActivatedRoute,
    private _location: Location,
    private _descuentoService: DescuentoService,
    public router: Router,
    public http: HttpClient
  ) { }

  ngOnInit() {
    this.tc = 1;
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
           this.formaVenta = this.venta.formaVenta;
           if (this.formaVenta.codFormaVenta != 1 || this.venta.esObsequio == true) {
             this.mostrarForma = true;
           } else {
            this.mostrarForma = false;
            this.cobranza =this.venta.cobranza;
            this.cobranzaDetalles = this.cobranza.detalle;
           }
           this.cliente = this.venta.cliente;
           this.detalles = this.venta.detalle;
           this.totalElementos = this.detalles.length;
          //  console.log('Venta',this.venta);
          //  console.log('cliente',this.cliente);
           this._empresasService.traerEmpresasPorId(this.venta.codEmpresa).subscribe((resp: any) => {
              // console.log('respuesta', resp);
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

  verTicketPdf(venta: number, tipoCopia:string) {
    this._ventasService.verTicket80Pdf(venta,tipoCopia  ).subscribe((response: any) => {
      const fileURL = URL.createObjectURL(response);
      window.open(fileURL, '_blank');
    });
  }
  atras() {
    this._location.back();
  }
  inprimirDuplicado() {
    this.tc = 2;
  }

}