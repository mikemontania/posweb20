import { Component, OnInit, OnChanges, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';

import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { VentasService } from '../../services/ventas/ventas.service';

import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { LoginService, UsuarioService, PedidosService, RepartoService, SucursalesService } from '../../services/service.index';

import { Sucursal } from 'src/app/models/sucursal.model';
import { Marcador } from 'src/app/models/repartoDocs.model';
@Component({
  selector: 'app-repartoDocs',
  templateUrl: './repartoDocs.component.html',
  styles: [`
  agm-map {
    height: 500px;
  }
  `]
})
export class RepartoDocsComponent implements OnInit {
  codReparto: number = 0;
  marcadores: Marcador[] = [];
  sucursal: Sucursal = null;
  distanciaTotal:number=0;
  importeTotal:number=0;
  mapCenterLat: number;
  mapCenterLng: number;
  mapZoom: number = 10; // Nivel de zoom inicial del mapa
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
    this.activatedRoute.paramMap.subscribe(async params => {
      this.codReparto = +params.get('codReparto');
      const codSucursal= +params.get('codSucursal');
      this._sucursalesServices.getSucursalbyId(codSucursal).subscribe(sucursal => {
        console.log(sucursal)
        this.sucursal = sucursal;
        if (this.codReparto) {
          this._repartoServices.getMarcadoresById(this.codReparto).subscribe(resp => {
            if (resp) {
              resp.sort((a, b) => a.orden - b.orden);
              this.marcadores = resp;
              this.calcularCentroMapa();
              this.distanciaTotal = this.calcularSumaDistancias();
              this.importeTotal = this.calcularSumaImportes();
            }
          })
        }

      })
    });

  }

  sortMarkerBySuc() {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading();
    this._repartoServices.sortMarkerBySuc(this.codReparto, this.sucursal.codSucursal).subscribe(resp => {
      if (resp) {
        // Ordenar el array por el campo 'orden'
        resp.sort((a, b) => a.orden - b.orden);
        this.marcadores = resp;
        this.distanciaTotal = this.calcularSumaDistancias();
        this.importeTotal = this.calcularSumaImportes();
      }
      Swal.close();
    })
  }
  sortMarkerByMarcador(codRepartoDoc:number) {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading();
    this._repartoServices.sortMarkerByMarcador(this.codReparto, codRepartoDoc).subscribe(resp => {
      if (resp) {
        // Ordenar el array por el campo 'orden'
        resp.sort((a, b) => a.orden - b.orden);
        this.marcadores = resp;
        this.distanciaTotal = this.calcularSumaDistancias();
        this.importeTotal = this.calcularSumaImportes();
      }
      Swal.close();
    })
  }

  changeOrder(codRepartoDocs:number, direccion:string) {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading();
    this._repartoServices.changeOrder(this.codReparto,codRepartoDocs, direccion).subscribe(resp => {
      if (resp) {
        this.marcadores=[]
        // Ordenar el array por el campo 'orden'
        resp.sort((a, b) => a.orden - b.orden);
        this.marcadores = resp;
        this.distanciaTotal = this.calcularSumaDistancias();
        this.importeTotal = this.calcularSumaImportes();
      }
      Swal.close();
    })
  }




  generateMapUrl(marcador: any) {
    const url = `http://www.google.com/maps/place/${marcador.latitud},${marcador.longitud}`;
    window.open(url, '_blank');
  }

  // Método para calcular la suma total de distancias
  calcularSumaDistancias(): number {
    let sumaDistancias = 0;
    // Itera sobre los marcadores y suma sus distancias
    for (let marcador of this.marcadores) {
      sumaDistancias += marcador.distancia;
    }
    return sumaDistancias;
  }

    // Método para calcular la suma total de  importes
    calcularSumaImportes(): number {
      let suma = 0;
      // Itera sobre los marcadores y suma sus distancias
      for (let marcador of this.marcadores) {
        suma += marcador.importe;
      }
      return suma;
    }

    calcularCentroMapa() {
      // Inicializar los límites del mapa
      let latMin = 90;
      let latMax = -90;
      let lngMin = 180;
      let lngMax = -180;

      // Calcular los límites para incluir todos los marcadores
      for (let marcador of this.marcadores) {
        if (marcador.latitud < latMin) latMin = marcador.latitud;
        if (marcador.latitud > latMax) latMax = marcador.latitud;
        if (marcador.longitud < lngMin) lngMin = marcador.longitud;
        if (marcador.longitud > lngMax) lngMax = marcador.longitud;
      }

      // Calcular el centro del mapa
      this.mapCenterLat = (latMin + latMax) / 2;
      this.mapCenterLng = (lngMin + lngMax) / 2;

      // Calcular el zoom del mapa para incluir todos los marcadores
      this.mapZoom = this.calcularNivelZoom(latMin, latMax, lngMin, lngMax);
    }

    calcularNivelZoom(latMin, latMax, lngMin, lngMax): number {
      const GLOBE_WIDTH = 256; // Tamaño de la imagen de fondo del mapa en píxeles

      // Calcular la longitud total de la vista en grados
      const lngDelta = lngMax - lngMin;
      const lngDeltaZoom = lngDelta > 0 ? lngDelta : 360 + lngDelta;

      // Calcular la longitud total de la vista en píxeles
      const pixDeltaX = GLOBE_WIDTH * (lngDeltaZoom / 360);

      // Calcular el nivel de zoom basado en la longitud total de la vista en píxeles
      const zoom = Math.round(Math.log(640 / pixDeltaX) / Math.LN2);

      return zoom;
    }



    copiarTabla() {
      // Seleccionar la tabla
      const tabla = document.querySelector('table');

      // Crear un rango de selección
      const range = document.createRange();
      range.selectNode(tabla);

      // Seleccionar el contenido de la tabla
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);

      // Copiar el contenido seleccionado
      document.execCommand('copy');

      // Limpiar la selección
      window.getSelection().removeAllRanges();

      // Notificar al usuario
      alert('La tabla ha sido copiada al portapapeles.');
    }

}
