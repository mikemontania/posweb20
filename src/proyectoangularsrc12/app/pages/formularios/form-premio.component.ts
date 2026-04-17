import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { CategoriaService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
 import { User } from '../../models/user.model';
import { PremioService } from '../../services/premio/premio.service';
import { UnidadMedidaService } from '../../services/unidadMedida/unidadMedida.service';
import { Empresas } from '../../models/empresas.model';
import { EmpresasService } from '../../services/empresas/empresas.service';
 import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { UnidadMedida } from '../../models/unidadMedida.model';
import { Premio } from '../../models/premio.model ';

@Component({
  selector: 'app-form-premio',
  templateUrl: './form-premio.component.html',
  styles: []
})
export class FormPremioComponent implements OnInit {
  cliente: Cliente;
  premio: Premio = new Premio();
  nombrePremio: string;
  nombreCliente: string;
  empresa: Empresas;
  imagenSubir: File;
  imagenTemp: any;
  sinImagen: string = './assets/images/sin-imagen.jpg';
  user: User;
  constructor(
    private toastr: ToastrService,
    private _loginService: LoginService,
    private _empresaServicies: EmpresasService,
    private _premioService: PremioService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.premio.codPremio = null; 
    this.premio.codPremioErp = ''; 
    this.premio.empresa = null;
    this.premio.descripcion = '';
    this.premio.codBarra = '';
    this.premio.puntos = 0;
    this.premio.descuento = 0;
    this.premio.activo = true; 
    this.premio.inventariable = false; 
    this.premio.obs = ''; 
    this.premio.img = ''; 
  }

  ngOnInit() {
    this.user = this._loginService.user;
    this.cargarEmpresa();
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._premioService.getPremio(id).subscribe((premio) => {
          this.premio = premio;
          this.premio.activo = premio.activo;
          this.premio.inventariable = premio.inventariable;
        });
      }
    });
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 1500 });
  }
  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }

  create(): any {
    this.premio.empresa = this.empresa ;
    console.log(this.premio);
    this._premioService.create(this.premio)
      .subscribe(
        (premio: Premio) => {
          if (this.imagenSubir) {
            this._premioService.uploadImage(this.imagenSubir, premio.codPremio).subscribe((pro: Premio) => {
              this.premio = pro;
              this.imagenTemp = null;
              $('#uploadedfile').val(null);
            });
          }
          this.router.navigate(['/premios']); 
          swal.fire('Nuevo Premio', `El premio ${this.premio.descripcion} ha sido creado con éxito`, 'success');
        },
        err => {
          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
          console.error('Código del error desde el backend: ' + err.status);
        }
      );
  }

  update(): void {
 
    this._premioService.updatePremio(this.premio)
      .subscribe(
        (json: Premio) => {
          this.router.navigate(['/premios']); 
          //  console.log("json: " + json.premio);
          if (this.imagenSubir) {
            this.cambiarImagen(this.premio.codPremio);
          }
          swal.fire('Premio Actualizado', `premio  : ${json.descripcion}`, 'success');
        },
        err => {
          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
          console.error('Código del error desde el backend: ' + err.status);
        }
      );
  }

  cargarEmpresa() {
    this._empresaServicies.getempresa(this.user.codEmpresa).subscribe(empresa => {
      this.empresa = empresa;
      this.premio.empresa = this.empresa ;  
    });
  }
 
  seleccionImage(archivo: File) {
    // si  no existe no hacer nada
    if (!archivo) {
      this.imagenSubir = null;
      return;
    }
    if (archivo.type.indexOf('image') < 0) {
      swal.fire('Sólo imágenes', 'El archivo seleccionado no es una imagen', 'error');
      this.imagenSubir = null;
      return;
    }
    this.imagenSubir = archivo;
    let reader = new FileReader();
    let urlImagenTemp = reader.readAsDataURL(archivo);
    reader.onloadend = () => {
      console.log(reader.result);
      this.imagenTemp = reader.result;
    };
  }


  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

  cambiarImagen(cod) {
    this._premioService.uploadImage(this.imagenSubir, cod).subscribe((premio: Premio) => {
      this.premio = premio;
      this.imagenTemp = null;
      $('#uploadedfile').val(null);
    });
  }

}
