import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { User } from '../../models/user.model';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { ABI_Punto_Retiro } from '../../models/abi-punto-retiro.model';
import { AbiOrdenService } from '../../services/abi-orden/abi-orden.service';
@Component({
  selector: 'app-form-abi-puntoRetiro',
  templateUrl: './form-abi-puntoRetiro.component.html',
  styles: [` 
  agm-map {
    height: 400px;
  }`]
})
export class FormABIPuntoRetiroComponent implements OnInit {
  lat = -25.29688941637652;
  lng = -57.59492960130746;
  latitud = 0;
  longitud = 0;
  puntoRetiro: ABI_Punto_Retiro  = new ABI_Punto_Retiro();
  user: User;
  errores:  ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _puntoRetiroServices: AbiOrdenService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {

      this.puntoRetiro.id=null;
      this.puntoRetiro.nombre='';
      this.puntoRetiro.calle_principal='';
      this.puntoRetiro.calle_secundaria='';
      this.puntoRetiro.numero='';
      this.puntoRetiro.referencia='';
      this.puntoRetiro.ubicacion='';
 
    }

  ngOnInit() {
    this.user = this._loginService.user;
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._puntoRetiroServices.getPuntoRetiroById(id).subscribe((puntoRetiro) => {
                this.puntoRetiro = puntoRetiro;
                if (puntoRetiro.ubicacion) {
                  const split = puntoRetiro.ubicacion.split(',');
                    this.lat = +split[0];
                    this.lng = +split[1];
                    this.latitud = +split[0];
                    this.longitud = +split[1];
                }
                console.log('id : ' + id);
              });
            }
          });
  }

  create(): void {
    this.puntoRetiro.ubicacion = this.latitud+','+this.longitud;
      this._puntoRetiroServices.createPuntoRetiro(this.puntoRetiro)
        .subscribe(
          puntoRetiro => {
            swal.fire('Nuevo puntoRetiro', `El puntoRetiro ${this.puntoRetiro.nombre} ha sido creada con éxito`, 'success');
          },
          err => {
            if (!err.error) {
              this.error('500 (Internal Server Error)');
              return;
            }
              this.errores = err.error.errors;
              console.error('Código del error desde el backend: ' + err.status);
          }
        );
  }

  update(): void { 
    this.puntoRetiro.ubicacion = this.latitud+','+this.longitud;
    this._puntoRetiroServices.updatePuntoRetiro(this.puntoRetiro)
      .subscribe(
        json => {
           swal.fire('Punto Retiro Actualizado', `puntoRetiro  : ${json.nombre}`, 'success');
        },
        err => {
          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
            this.errores = err.error.errors;
            console.error('Código del error desde el backend: ' + err.status);
        }
      );
  }

  invalido() {
    this.toastr.error('Favor completar todos los campos correctamente', 'Invalido',
    {timeOut: 1500});
  }
  error(err) {
    this.toastr.error(err, 'Error',
    {timeOut: 2500});
  }
  
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }
  
  agregarMarcador(evento) {
    console.log(evento);
    const coords: { lat: number, lng: number } = evento.coords;
    this.latitud = coords.lat;
    this.longitud = coords.lng;
  }
}
