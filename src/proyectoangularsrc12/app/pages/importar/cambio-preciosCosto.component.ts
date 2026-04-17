import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ClienteService, PrecioMaterialService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { User } from '../../models/user.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import * as XLSX from 'xlsx';
import { ProductoService } from '../../services/producto/producto.service';
import Swal from 'sweetalert2';
import { Producto } from '../../models/producto.model';
import { PrecioMaterial } from '../../models/precioMaterial.model';
import { Sucursal } from '../../models/sucursal.model';
interface ExcelPrecio {
  codigo: string;
  encontrado: boolean;
  precioActual: number;
  precioNuevo: number;
  producto: string;
  codProducto: number;
}

@Component({
  selector: 'app-cambio-precios-costo',
  templateUrl: './cambio-preciosCosto.component.html',
  styles: []
})
export class CambioPreciosCostoComponent implements OnInit {
  precioCosto: PrecioMaterial = new PrecioMaterial();
  cargadorSucursal: Sucursal;
   excel: string = './assets/images/excel.png';
  editable: boolean = false;
  archivo: File;
  preciosSinCambios: PrecioMaterial[] = [];
  preciosModificados: PrecioMaterial[] = [];
  preciosEncontrados: PrecioMaterial[] = [];
  preciosACrear: PrecioMaterial[] = [];
  preciosNoEncontrados: ExcelPrecio[] = [];
  preciosMateriales: ExcelPrecio[] = [];
  seleccionListaPrecio: number;
  user: User;
  willDownload = false;
  array: any[] = [];
  data: any = [[1, 2], [3, 4]];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'SheetJS.xlsx';
  constructor(
    private _productoServices: ProductoService,
    private toastr: ToastrService,
    private _precioMaterialService: PrecioMaterialService,
    private _loginService: LoginService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.precioCosto.codPrecioMaterial = null;
    this.precioCosto.codEmpresa = this._loginService.user.codEmpresa;
    this.precioCosto.sucursal = this.cargadorSucursal;
    this.precioCosto.producto = null;
    this.precioCosto.fechaCreacion = null;
    this.precioCosto.fechaModificacion = null;
    this.precioCosto.precioCosto = null;
  }

  ngOnInit() {
    this.editable = true;
    this.seleccionListaPrecio = 0;
    this.preciosMateriales = [];
    this.preciosModificados = [];
    this.preciosSinCambios = [];
    this.preciosEncontrados = [];
    this.preciosNoEncontrados = [];
    $('#uploadedfile').val(null);
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 2500 });
  }

  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }


  cancelar() {
    this.ngOnInit();
  }

  onFileChange(event) {
    this.editable = false;
    let tipo = event.target.value;
    let extencion = tipo.substring(tipo.length - 5, tipo.length - 1);
    if (extencion != '.xls') {
      console.error(extencion);
      $('#uploadedfile').val(null);
      this.editable = true;
      this.invalido('El archivo debe estar en formato excel');
      return;
    }
    /*cablear lector de archivos*/
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* leer cuaderno */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      /* agarra la primera hoja */
      const nombreArchivo: string = wb.SheetNames[0];
      console.log('nombreArchivo', nombreArchivo);
      const hoja: XLSX.WorkSheet = wb.Sheets[nombreArchivo];
      console.log('hoja', hoja);      /* guardar datos*/
      let codigo = hoja.A1.h;
      let precio = hoja.B1.h;
      let codigocsv = hoja.A1.v;
      let preciocsv = hoja.B1.v;
      if (codigo != 'codigo' && codigocsv != 'codigo') {
        console.log('codigo', codigo);
        this.invalido('Verifique el campo codigo');
        return;
      }
      if (precio != 'precio' && preciocsv != 'precio') {
        console.log('precio', precio);
        this.invalido('Verifique el campo precio');
        return;
      }
      this.data = <any>(XLSX.utils.sheet_to_json(hoja, { header: 2 }));
      this.cargarArray();
    };
    reader.readAsBinaryString(target.files[0]);
  }



  async getPrecioActual(codProductoErp: string, codSucursalErp: string) {
    let precio = this._precioMaterialService.findByPrecioCostoActual(codProductoErp, codSucursalErp)
      .toPromise();
    return precio;
  }

  async cambiarPrecios() {
    let preciosValidos = this.preciosEncontrados.filter(precio => precio.producto.codProductoErp)
    console.log(preciosValidos);
    console.log(this.preciosEncontrados);
    let precios = this._precioMaterialService.cambiarPrecios(this._loginService.user.codEmpresa, this.cargadorSucursal.codSucursalErp, this.preciosEncontrados)
      .toPromise();
    console.log(precios);
    return precios;
  }

  cambioPrecios() {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que modificar ${this.preciosEncontrados.length} precios de la lista ?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, modificar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then(async (result) => {
      if (result.value) {
        let pre = await this.cambiarPrecios();
        this.preciosModificados = pre;
        this.preciosModificados.sort(function (a, b) {
          return +a.producto.codProductoErp - +b.producto.codProductoErp;
        });
        this.preciosMateriales = [];
        this.preciosSinCambios = [];
        this.preciosEncontrados = [];
        this.preciosNoEncontrados = [];
        Swal.fire(
          'Precios modificados!',
          `${pre.length} precios modificados con éxito.`,
          'success'
        );
      }
    });
  }

  async cargarArray() {
    this.data.forEach(async element => {
      let precioNuevo = +element.precio.replace(',', '');
      let precioCosto: PrecioMaterial = await this.getPrecioActual(element.codigo, this.cargadorSucursal.codSucursalErp);
      console.log(precioCosto);
      if (precioCosto && precioCosto.precioCosto && precioCosto.producto) {
        this.preciosMateriales.push({ codigo: element.codigo, encontrado: true, precioNuevo: +precioNuevo, producto: precioCosto.producto.nombreProducto, codProducto: precioCosto.producto.codProducto, precioActual: precioCosto.precioCosto });
        if (precioCosto.precioCosto == precioNuevo) {
          this.preciosSinCambios.push(precioCosto);
        } else {
          precioCosto.precioCosto = precioNuevo;
          this.preciosEncontrados.push(precioCosto);
        }
        //   this.preciosEncontrados.push({ codigo: element.codigo, encontrado: true, precioNuevo: +precioNuevo, producto: precio.producto.nombreProducto, codProducto: precio.producto.codProducto, precioActual: precio.precio });
      } else {

        this.invalido('El producto ' + element.codigo + ' no tiene precio');
        let material: Producto = await this.getProductoByCodErp(element.codigo);
        let obs = (material ? 'NO EXISTE PRECIO' : 'NO EXISTE MATERIAL');
        this.preciosMateriales.push({ codigo: element.codigo, encontrado: false, precioNuevo: +precioNuevo, producto: obs, codProducto: null, precioActual: null });
        if (obs == 'NO EXISTE PRECIO') {
          this.preciosNoEncontrados.push({ codigo: element.codigo, encontrado: false, precioNuevo: +precioNuevo, producto: obs, codProducto: null, precioActual: null });
        }

      }
    });
    console.log(this.preciosMateriales);
    console.log(this.preciosEncontrados);
  }



  seleccionarSucursal(item: Sucursal) {
    this.cargadorSucursal = item;
  }
 
  async confirmarFormulario() {
    this.preciosACrear.splice(0, this.preciosACrear.length);
    if (!this.cargadorSucursal) {
      this.invalido('SUCURSAL PUEDE SER NULL');
      return;
    }
    console.log(this.preciosNoEncontrados);
    for await (const item of this.preciosNoEncontrados) {
      let producto: Producto = await this.getProductoByCodErp(item.codigo);
      let precioCosto: PrecioMaterial = new PrecioMaterial();

      precioCosto.codPrecioMaterial = null;
      precioCosto.codEmpresa = this._loginService.user.codEmpresa;
      precioCosto.sucursal = this.cargadorSucursal;
      precioCosto.producto = producto;
      precioCosto.fechaCreacion = new Date();
      precioCosto.fechaModificacion = new Date();
      precioCosto.precioCosto = item.precioNuevo;


      if (precioCosto && precioCosto.producto && precioCosto.sucursal) {
        this.preciosACrear.push(precioCosto);
      } else {
        this.invalido('producto o precio no valido en:' + item.codigo);
      }
    }
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
    });
    Swal.showLoading();
    let nuevosPrecios: PrecioMaterial[] = await this.crearPrecios();
    this.preciosMateriales.splice(0, this.preciosMateriales.length);
    this.preciosNoEncontrados.splice(0, this.preciosNoEncontrados.length);
    this.preciosEncontrados.splice(0, this.preciosEncontrados.length);
    this.preciosModificados = nuevosPrecios;
    Swal.close();
  }

  crearPrecios() {
    
    console.log(this.preciosACrear);
    let listado = this._precioMaterialService.crearPrecios(this.preciosACrear)
      .toPromise();
  
    return listado;
  }
  async getProductoByCodErp(cod: string) {
    let producto = this._productoServices.getProductoByCodErp(cod)
      .toPromise();
    return producto;
  }
}

