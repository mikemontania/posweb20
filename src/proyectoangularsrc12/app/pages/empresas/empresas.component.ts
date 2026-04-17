import { Component, OnInit } from '@angular/core';
import { Empresas } from '../../models/empresas.model';
import { EmpresasService, UsuarioService,  LoginService } from '../../services/service.index';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styles: []
})
export class EmpresasComponent implements OnInit {
  editable: boolean = true;
  imagenSubir: File;
  imagenTemp: any;
  imagenSubirReport: File;
  imagenTempReport: any;
  sinImagen: string = './assets/images/sin-imagen.jpg';
  empresas: Empresas[] = [];
  empresa: Empresas ;
  paginador: any;
  empresaSeleccionado: Empresas;
  imagen: null;
  imagenReporte: null;
  user: User;
  constructor( 
    public _empresasService: EmpresasService,
    public _loginService: LoginService,
    private toastr: ToastrService,
              private activatedRoute: ActivatedRoute  ) { }

  ngOnInit() {
    this.editable = true;
    this.cargarEmpresas(this._loginService.user.codEmpresa);
    this.user = this._loginService.user;
  }

 cargarEmpresas(cod) {
  this._empresasService.traerEmpresasPorId(cod).subscribe((resp: any) => {
    console.log('respuesta', resp);
    this.empresa = resp;
    this.empresas.push(this.empresa);
    console.log('this.empresas', resp);
 //  console.log(resp[0].img);
  });
 }
 

seleccionImage( archivo: File ) {
  // si  no existe no hacer nada
    if ( !archivo ) {
      this.imagenSubir = null;
      return;
    }
    if ( archivo.type.indexOf('image') < 0 ) {
      Swal.fire('Sólo imágenes', 'El archivo seleccionado no es una imagen', 'error');
      this.imagenSubir = null;
      return;
    }
    this.imagenSubir = archivo;
    let reader = new FileReader();
    let urlImagenTemp = reader.readAsDataURL( archivo );
    reader.onloadend = () => {
      console.log(reader.result);
      this.imagenTemp = reader.result;
    };
  }

  seleccionImageReport( archivo: File ) {
    // si  no existe no hacer nada
      if ( !archivo ) {
        this.imagenSubirReport = null;
        return;
      }
      if ( archivo.type.indexOf('image') < 0 ) {
        Swal.fire('Sólo imágenes', 'El archivo seleccionado no es una imagen', 'error');
        this.imagenSubirReport = null;
        return;
      }
      this.imagenSubirReport = archivo;
      let reader = new FileReader();
      let urlImagenTemp = reader.readAsDataURL( archivo );
      reader.onloadend = () => {
        console.log(reader.result);
        this.imagenTempReport = reader.result;
      };
    }

cambiarImagen(cod) {
  this._empresasService.uploadImage(this.imagenSubir, cod).subscribe((empresa: Empresas) => {
  this.empresa = empresa ;
  this.imagenTemp = null;
  $('#uploadedfile').val(null);
 });
}

cambiarImagenReport(cod) {
  this._empresasService.uploadImageReport(this.imagenSubirReport, cod).subscribe((empresa: Empresas) => {
  this.empresa = empresa ;
  this.imagenTempReport = null;
  $('#uploadedfileReport').val(null);
 });
}

update(): void {
 /*  if (!this.producto.unidad) {
    this.invalido('Unidad de medida no puede ser nulo');
    return;
  }
  if (!this.producto.categoriaProducto) {
    this.invalido('categoria producto  no puede ser nulo');
    return;
  }
  if (!this.producto.catABC) {
    this.invalido('categoria abc no puede ser nulo');
    return;
  }
  if (this.producto.cantidadMin > this.producto.cantidadMax) {
    this.invalido('cantidad minima no puede ser mayor a cantidad maxima');
    return;
  } */
  this._empresasService.update(this.empresa)
    .subscribe(
      (json:Empresas) => {
        this.editable = true;

 
       if (this.imagenSubir) {
         this.cambiarImagen(this.empresa.codEmpresa);
       }
       if (this.imagenSubirReport) {
        this.cambiarImagenReport(this.empresa.codEmpresa);
      }
        Swal.fire('Empresa Actualizada', `Empresa  : ${json.razonSocial}`, 'success');
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

invalido(invalido) {
  this.toastr.error(invalido, 'Invalido',
  {timeOut: 1500});
}
error(err) {
  this.toastr.error(err, 'Error',
  {timeOut: 2500});
}

editar() {
  this.editable = false;
}
cancelar() {
  this.ngOnInit();
  this.editable = true;
}

}
