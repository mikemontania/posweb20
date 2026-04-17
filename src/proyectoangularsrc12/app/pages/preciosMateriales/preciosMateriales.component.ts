import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { PrecioService } from '../../services/precio/precio.service';
import { Precio } from '../../models/precio.model';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { ListaPrecioService } from '../../services/ListaPrecio/listaPrecio.service';
import { User } from '../../models/user.model';
import { Producto } from '../../models/producto.model';
import { LoginService } from '../../services/login/login.service';
import { PrecioMaterial } from '../../models/precioMaterial.model';
import { Sucursal } from '../../models/sucursal.model';
import { PrecioMaterialService } from '../../services/precioMaterial/precioMaterial.service';
import { ExcelService } from '../../services/xlsx/xlsx.service';
import { ToastrService } from 'ngx-toastr';
import { Material } from '../../models/material.model';
@Component({
  selector: 'app-preciosMateriales',
  templateUrl: './preciosMateriales.component.html',
  styles: []
})
export class PreciosMaterialesComponent implements OnInit {
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  preciosMateriales: PrecioMaterial[] = [];
  cargadorProducto: Producto;
  cargadorSucursal: Sucursal;
  paginador: any;
  paginas = [];
  busqueda: string = '';
  codeProd: number = 0;
  codeSuc: number = 0;
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/preciosMateriales/page';
  user: User;
  constructor(private _precioMaterialesService: PrecioMaterialService,
    private _loginServices: LoginService,
    public _excelService: ExcelService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) { }

  ngOnInit() {
    this.user = this._loginServices.user;
    this.busqueda = '';
    this.codeProd = 0;
    this.codeSuc = 0;
    this.cargando = true;
    this.cargadorProducto = null;
    this.cargadorSucursal = null;
    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, 0]);
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
        this.router.navigate([this.rutaPaginador, 0]);
      }
      this.traerPreciosMateriales(page, this.codeProd, this.codeSuc);
    });
    /*=====================================================*/
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }

  buscarPrecios() {

    this.router.navigate([this.rutaPaginador, 0]);
    debounceTime(300);
    distinctUntilChanged();

    this.cargando = true;
    this.traerPreciosMateriales(0, this.codeProd, this.codeSuc);
  }

  traerPreciosMateriales(page, codeProd, codeSuc) {
    this._precioMaterialesService.traerPreciosMaterialesPorPaginas(page, codeProd, codeSuc)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        console.log(response.content);
        this.preciosMateriales = response.content as PrecioMaterial[];
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.preciosMateriales = [];
        } else {
          this.cargando = false;
        }
      });
  }


  seleccionarProducto(item: Producto) {
    console.log(item);
    if (item) {
      this.cargadorProducto = item;
      this.codeProd = item.codProducto;
    } else {
      this.codeProd = 0;
      this.cargadorProducto = null;
    }
    console.log(this.cargadorProducto);
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



  delete(precio: PrecioMaterial) {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el precio ?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this._precioMaterialesService.delete(precio.codPrecioMaterial).subscribe(
          () => {
            this.preciosMateriales = this.preciosMateriales.filter(pre => pre !== precio);
            Swal.fire(
              'Precio Eliminado!',
              `Precio se elimino con éxito.`,
              'success'
            );
            this.ngOnInit();
          }
        );

      }
    });
  }

  getReporte() {
    let codSucursal = this.cargadorSucursal ? this.cargadorSucursal.codSucursal : 0;
    this._precioMaterialesService.getPrecioMaterialBySucursalId(codSucursal)
      .subscribe((response: PrecioMaterial[]) => {
        if (response.length > 0) {
          let arrayMateriarles: Material[] = [];
          response.forEach(precio => {
            let material: Material = new Material();
            material.codEmpresa = precio.codEmpresa;
            material.codSucursalErp = precio.sucursal.codSucursalErp;
            material.sucursal = precio.sucursal.nombreSucursal;
            material.codProductoErp = precio.producto.codProductoErp;
            material.codBarra = precio.producto.codBarra;
            material.producto = precio.producto.nombreProducto;
            material.precioCosto = precio.precioCosto;
            material.fechaModificacion = precio.fechaModificacion;
            arrayMateriarles.push(material);
          });
          console.log(arrayMateriarles);
          this._excelService.exportAsExcelFile(arrayMateriarles, 'xlsx');
        } else {
          this.invalido('No se puede exportar datos de la nada!!!');
        }
      });

  }
  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 1500 });
  }
}
