import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { GrupoMaterial } from '../../models/grupoMaterial.model';
import { User } from '../../models/user.model';
import { ErrModel } from '../../models/ErrModel.model';

import { ToastrService } from 'ngx-toastr';

import { LoginService } from '../../services/login/login.service';
import { GrupoMaterialService } from '../../services/service.index';
@Component({
  selector: 'app-form-grupoMaterial',
  templateUrl: './form-grupoMaterial.component.html',
  styles: []
})
export class FormGrupoMaterialComponent implements OnInit {
  grupoMaterial: GrupoMaterial = new GrupoMaterial();
  user: User;
  errores: ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _grupoMaterialServices: GrupoMaterialService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.grupoMaterial.codEmpresa = this._loginService.user.codEmpresa;
    this.grupoMaterial.codGrupoErp = null; 
    this.grupoMaterial.descripcion = ''; 
  }

  ngOnInit() {
    this.user = this._loginService.user;
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      
      if (id) {
        this._grupoMaterialServices.getById(id).subscribe((g) => {
          this.grupoMaterial = g;
        });
      }
    });
  }

  create(): void {
    this._grupoMaterialServices.create(this.grupoMaterial)
      .subscribe(
        grp => {
          this.router.navigate(['/grupoMaterial']);
          swal.fire('Nuevo grupo material', `El grupo ${this.grupoMaterial.descripcion} ha sido creada con éxito`, 'success');
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
    this._grupoMaterialServices.update(this.grupoMaterial)
      .subscribe(
        json => {
          this.router.navigate(['/grupoMaterial']);
          swal.fire('Lista Actualizada', `Grupo  : ${json.descripcion}`, 'success');
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
      { timeOut: 1500 });
  }

  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }

  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }
}
