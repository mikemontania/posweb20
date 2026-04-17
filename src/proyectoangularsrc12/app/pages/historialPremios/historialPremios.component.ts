import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LoginService } from '../../services/login/login.service';
import { HistorialPremio } from 'src/app/models/historialPremio.model';
import { HistorialPremioService, SucursalesService } from 'src/app/services/service.index';
import { Sucursal } from 'src/app/models/sucursal.model';
import { Premio } from 'src/app/models/premio.model ';
import * as moment from 'moment';
@Component({
  selector: 'app-historialPremios',
  templateUrl: './historialPremios.component.html',
  styles: []
})
export class HistorialPremiosComponent implements OnInit {
  cargando: boolean = false;
  fechaInicio: string;
  historiales: HistorialPremio[] = [];
  cargadorPremio: Premio;
  cargadorSucursal: Sucursal;
  busqueda: string = '';
  codePremio: number = 0;
  codeSuc: number;
  seleccionSucursal: number;
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  paginador: any;
  paginas = [];
  tamanhoPag: string = 'md';
  pagina: number = 0;
  currentPage: number;
  pageSize: number;
  rutaPaginador: string = '/historialPremios/page';
  rol: string;
  constructor(private _historialPremioService: HistorialPremioService,
    private _loginServices: LoginService,
    private activatedRoute: ActivatedRoute,
    private _sucursalServices: SucursalesService,
    public router: Router,
    public http: HttpClient
  ) { 
    this.rol = this._loginServices.user.authorities[0];
    this.currentPage = 1;
    this.pageSize = 20;
    this.codeSuc = (this._loginServices.user.authorities[0] == 'ROLE_ADMIN') ? 0 : this._loginServices.user.codSucursal; 
  }

  ngOnInit() {
    console.log( this.rol)
    console.log(this.codeSuc)
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD'); 
    this.busqueda = '';
    this.codePremio = 0;
    this.cargando = true;
    this.cargadorPremio = null;
    this.seleccionSucursal = 0;
    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, 0]);
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
        this.router.navigate([this.rutaPaginador, 0]);
      }
      this.traerHistorial();
    });
    /*=====================================================*/
  }

  buscar() {
    this.traerHistorial();
  }

  traerHistorial() {
     this._historialPremioService.getLista(  this.codeSuc,this.codePremio ,this.fechaInicio)
       .subscribe(async (response: any) => {
        console.log(response);
        this.historiales = await Promise.all(response.map(async (h: HistorialPremio) => ({
          ...h,
          sucursal: await this.getSucursalById(h.codSucursal)
        })));
        console.log(this.historiales);
        this.cargando = false;


      });
  }



  seleccionarPremio(item: Premio) {
    console.log(item);
    if (item) {
      this.cargadorPremio = item;
      this.codePremio = item.codPremio;
    } else {
      this.codePremio = 0;
      this.cargadorPremio = null;
    }
    console.log(this.cargadorPremio);
  }

  seleccionarSucursal(item: Sucursal) {
    console.log(item);
    if (item) {
      this.cargadorSucursal = item;
      this.codeSuc = item.codSucursal;
    } else {
      this.codeSuc = 0;
      this.cargadorSucursal = null;
    }
    console.log(this.cargadorSucursal);
  }

  async getSucursalById(id) {
    let sucursal: Sucursal = await this._sucursalServices.getSucursalbyId(id).toPromise();
    return sucursal;
  }

}
