import { Component, OnInit } from '@angular/core';
import { LoginService, InfluencersService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Influencer } from 'src/app/models/influencer.model';
import { response } from 'express';

@Component({
  selector: 'app-influencers',
  templateUrl: './influencers.component.html',
  styles: []
})
export class InfluencerComponent implements OnInit {
  influencer: Influencer = new Influencer();
  modalInfluencer: string = 'oculto';
  cargando: boolean = false;
  totalElementos: number = 0;
  tamanhoPag: string = 'md';
  currentPage: number;
  pageSize: number;
  influencers: Influencer[] = [];
  constructor(private _influencerService: InfluencersService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.influencer.codEmpresa = this._loginService.user.codEmpresa;



    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this._influencerService.traerByCodEmp(this._loginService.user.codEmpresa)
      .subscribe((response: any) => {
        if (response) {
          this.influencers = response as Influencer[];
          console.log(this.influencers);
        } else {
          this.influencers = [];
        }
      });
  }


  editarInfluencer(influencer: Influencer) {
    this.influencer.codEmpresa = influencer.codEmpresa;
    this.influencer.activo = influencer.activo;
    this.influencer.codInfluencer = influencer.codInfluencer;
    this.influencer.influencer = influencer.influencer;
    this.influencer.cupon = influencer.cupon;
    this.influencer.descuento = influencer.descuento;
    this.influencer.fechaDesde = influencer.fechaDesde;
    this.influencer.fechaHasta = influencer.fechaHasta;
    this.influencer.cantSeguidores = influencer.cantSeguidores;
    this.influencer.cantValidez = influencer.cantValidez;
    this.modalInfluencer = '';
  }
  mostrarModalInfluencer() {
    this.modalInfluencer = '';
    this.influencer.activo = true;
    this.influencer.codInfluencer = null;
    this.influencer.influencer = '';
    this.influencer.cupon = '';
    this.influencer.descuento = 0;
    this.influencer.fechaDesde = null;
    this.influencer.fechaHasta = null;
    this.influencer.cantSeguidores = 0;
    this.influencer.cantValidez = 1;
  }
  ocultarModalInfluencer() {
    this.modalInfluencer = 'oculto';
  }


  create() { 
    this.influencer.codInfluencer = null;

    //Convertir el codigo cupon a mayusculas
    this.influencer.cupon = this.influencer.cupon.toUpperCase();

    this._influencerService.create(this.influencer)
      .subscribe(
        (json: Influencer) => {
          console.log(json)
          if (json) {
            this.influencers.push(json);
          }
          this.modalInfluencer = 'oculto';
          Swal.fire('Nuevo Influencer',
            `El Influencer ${json.influencer} ha sido creado con éxito`, 'success');
        },
        err => {
          if (!err.error) {
            return;
          }
          console.error('Código del error desde el backend: ' + err.status);
        }
      );

  }


  editar() {
    this.influencer.cupon = this.influencer.cupon.toUpperCase();
    
    this._influencerService.update(this.influencer)
      .subscribe(
        (json: Influencer) => { 
          this.modalInfluencer = 'oculto';

          Swal.fire('Influencer Actualizado', `El Influencer ${json.influencer} ha sido actualizado con éxito`, 'success');
          this.ngOnInit();
        },
        err => {
          if (!err.error) {
            return;
          }
          console.error('Código del error desde el backend: ' + err.status);
        }
      ); 
  }

}
