import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, MedioPagoService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { User } from '../../models/user.model';
import { Sucursal } from '../../models/sucursal.model';
import { Producto } from '../../models/producto.model';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { PrecioMaterial } from '../../models/precioMaterial.model';
import { PrecioMaterialService } from '../../services/precioMaterial/precioMaterial.service';
import * as moment from 'moment';

@Component({
  selector: 'app-form-preciosMateriales',
  templateUrl: './form-preciosMateriales.component.html',
  styles: []
})
export class FormPreciosMaterialesComponent implements OnInit {
  precioMaterial: PrecioMaterial = new PrecioMaterial();
   producto: Producto;
   sucursal: Sucursal;
  nombreProducto: string;
  nombreSucursal: string;
  cargadorProducto: Producto;
  cargadorSucursal: Sucursal;
 
  user: User;

  seleccionMedioPago: number;
  titulo: string = 'Crear Precio material';
  errores: ErrModel[];
 

  constructor( 
    private toastr: ToastrService,
    private _precioMaterialService: PrecioMaterialService,
     private _loginService: LoginService,
     private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.precioMaterial.codPrecioMaterial = null;
     this.precioMaterial.codEmpresa = this._loginService.user.codEmpresa;
     this.precioMaterial.producto = null;
    this.precioMaterial.sucursal = null;
    this.precioMaterial.fechaCreacion =null;
    this.precioMaterial.fechaModificacion =null;
    this.precioMaterial.precioCosto = null;
     }

    ngOnInit() {
    this.user = this._loginService.user;
 
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._precioMaterialService.getPrecioMaterialById(id).subscribe((precioMaterial) => {
                this.precioMaterial = precioMaterial;

                if (precioMaterial.producto) {
                  this.cargadorProducto = precioMaterial.producto;
                } else {
                  this.cargadorProducto = null;
                }

                if (precioMaterial.sucursal) {
                  this.cargadorSucursal = precioMaterial.sucursal;
                } else {
                  this.cargadorSucursal = null;
                }
 
                console.log('id : ' + id);
              /*   if (id === 0) {

                } else {


                } */
              });
            }
          });
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
    {timeOut: 2500});
  }

  error(err) {
    this.toastr.error(err, 'Error',
    {timeOut: 2500});
  }

    create(): void {
      this.precioMaterial.codEmpresa = this.user.codEmpresa;
      if (this.precioMaterial.precioCosto < 0) {
        this.invalido('Precio no puede ser menor a 0');
        return;
      }
      if (!this.precioMaterial.producto) {
        this.invalido('producto no puede ser nulo');
        return;
      }
      if (!this.precioMaterial.sucursal) {
        this.invalido('sucursal  no puede ser nulo');
        return;
      }
    
      console.log(this.precioMaterial);
      this._precioMaterialService.create(this.precioMaterial)
        .subscribe(
          pre => {
            this.router.navigate(['/preciosMateriales']);
            swal.fire('Nuevo Precio', `El precio  ha sido creado con éxito`, 'success');
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
       if (this.precioMaterial.precioCosto < 0) {
        this.invalido('Precio no puede ser menor a 0');
        return;
      }
      if (!this.precioMaterial.producto) {
        this.invalido('producto no puede ser nulo');
        return;
      }
      if (!this.precioMaterial.sucursal) {
        this.invalido('sucursal  no puede ser nulo');
        return;
      }
    this._precioMaterialService.update(this.precioMaterial)
      .subscribe(
        json => {
          this.router.navigate(['/preciosMateriales']);

          swal.fire('Precio Actualizado', `El precio fue actualizado con exito`, 'success');
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

  /**********************************************CARGADORES************************************************************** */

     seleccionarProducto(item: Producto) {
      if (item) {
        console.log(item);
        this.cargadorProducto = item;
        this.precioMaterial.producto = item;
        console.log(this.cargadorProducto);
      } else {
          this.producto = null;
          this.precioMaterial.producto = null;
      }
     }


     seleccionarSucursal(item: Sucursal) {
      if (item) {
        console.log(item);
        this.cargadorSucursal = item;
        this.precioMaterial.sucursal = item;
        console.log(this.cargadorSucursal);
      } else {
          this.sucursal = null;
          this.precioMaterial.sucursal = null;
      }
     }
 
}
