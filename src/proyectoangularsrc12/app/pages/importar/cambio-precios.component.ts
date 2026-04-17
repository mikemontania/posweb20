import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ClienteService, TipoPrecioService, UnidadMedidaService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { User } from '../../models/user.model';
import { Precio } from '../../models/precio.model';
import { PrecioService } from '../../services/precio/precio.service';
import { ListaPrecioService } from '../../services/ListaPrecio/listaPrecio.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import * as XLSX from 'xlsx';
import { ProductoService } from '../../services/producto/producto.service';
import Swal from 'sweetalert2';
import { TipoPrecio } from '../../models/tipoPrecio.model';
import { Producto } from '../../models/producto.model';
import { UnidadMedida } from '../../models/unidadMedida.model';
interface ExcelPrecio {
  codigo: string;
  encontrado: boolean;
  precioActual: number;
  precioNuevo: number;
  producto: string;
  codProducto: number;
}

@Component({
  selector: 'app-cambio-precios',
  templateUrl: './cambio-precios.component.html',
  styles: []
})
export class CambioPreciosComponent implements OnInit {
  precio: Precio = new Precio();
  modalFormulario: string = 'oculto';
  excel: string = './assets/images/excel.png';
  editable: boolean = false;
  archivo: File;
  preciosSinCambios: Precio[] = [];
  preciosModificados: Precio[] = [];
  preciosEncontrados: Precio[] = [];
  preciosACrear: Precio[] = [];
  unidadMedida: UnidadMedida[] = [];
  tipoPrecio: TipoPrecio[] = [];
  seleccionUnidad: number;
  seleccionTipoPrecio: number;
  preciosNoEncontrados: ExcelPrecio[] = [];
  precios: ExcelPrecio[] = [];
  listaPrecio: ListaPrecio[] = [];
  seleccionListaPrecio: number;
  user: User;
  willDownload = false;
  array: any[] = [];
  data: any = [[1, 2], [3, 4]];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'SheetJS.xlsx';
  constructor(private _clienteService: ClienteService,
    private _listaPrecioServices: ListaPrecioService,
    private _tipoPrecioService: TipoPrecioService,
    private _unidadService: UnidadMedidaService,
    private _productoServices: ProductoService,
    private toastr: ToastrService,
    private _precioService: PrecioService,
    private _loginService: LoginService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.precio.codPrecio = null;
    this.precio.codPrecioErp = null;
    this.precio.codEmpresa = this._loginService.user.codEmpresa;
    this.precio.tipoPrecio = null;
    this.precio.producto = null;
    this.precio.unidadMedida = null;
    this.precio.cliente = null;
    this.precio.listaPrecio = null;
    this.precio.fechaDesde = null;
    this.precio.fechaHasta = null;
    this.precio.cantDesde = null;
    this.precio.cantHasta = null;
    this.precio.precio = null;
    this.precio.activo = true;
  }

  ngOnInit() {
    this.editable = true;
    this.seleccionListaPrecio = 0;
    this.precios = [];
    this.preciosModificados = [];
    this.preciosSinCambios = [];
    this.preciosEncontrados = [];
    this.preciosNoEncontrados = [];
    $('#uploadedfile').val(null);
    this.cargarlistaPrecio();
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

  async getPrecioActual(codProductoErp: string, codListaPrecio) {
    let precio = this._precioService.getPrecioActual(codProductoErp, codListaPrecio)
      .toPromise();
    return precio;
  }

  async cambiarPrecios() {
    console.log(this.preciosEncontrados)
    let precios = this._precioService.cambiarPrecios(this.seleccionListaPrecio, this.preciosEncontrados)
      .toPromise();
    console.log(precios)
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
        this.precios = [];
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
      let precio: Precio = await this.getPrecioActual(element.codigo, this.seleccionListaPrecio);
      console.log(precio);
      if (precio) {
        this.precios.push({ codigo: element.codigo, encontrado: true, precioNuevo: +precioNuevo, producto: precio.producto.nombreProducto, codProducto: precio.producto.codProducto, precioActual: precio.precio });
        if (precio.precio == precioNuevo) {
          this.preciosSinCambios.push(precio);
        } else {
          precio.precio = precioNuevo;
          this.preciosEncontrados.push(precio);
        }
      } else {
        this.invalido('El producto ' + element.codigo + ' no tiene precio');
        let material: Producto = await this.getProductoByCodErp(element.codigo);
        let obs = (material ? 'NO EXISTE PRECIO' : 'NO EXISTE MATERIAL');
        this.precios.push({ codigo: element.codigo, encontrado: false, precioNuevo: +precioNuevo, producto: obs, codProducto: null, precioActual: null });
        if (obs == 'NO EXISTE PRECIO') {
          this.preciosNoEncontrados.push({ codigo: element.codigo, encontrado: false, precioNuevo: +precioNuevo, producto: obs, codProducto: null, precioActual: null });
        }

      }
    });
    console.log(this.precios);
    console.log(this.preciosEncontrados);
  }
 

  /**********************************************CARGADORES************************************************************** */
  cargarlistaPrecio() {
    this._listaPrecioServices.traerListaPrecio(this._loginService.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.listaPrecio = resp;
      this.listaPrecio.push({
        codListaPrecio: 0,
        codListaPrecioErp: '00',
        descripcion: 'NINGUNA',
        codEmpresa: 0,
        ecommerce: false,
        esAdmin: false
      });
    });
  }



  /*************************************************************************************************************/

  cargarTipoPrecio() {
    this._tipoPrecioService.traerTipoPrecio(this._loginService.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.tipoPrecio = resp;
    });
  }

  cargarUnidadMedida() {
    this._unidadService.traerUnidadMedida(this._loginService.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.unidadMedida = resp;
    });
  }


  /*************************************************************************************************************/

  cambioListaPrecio(codListaPrecio) {
    if (codListaPrecio) {
      let indice = this.listaPrecio.findIndex((l) => l.codListaPrecio == codListaPrecio);
      this.precio.listaPrecio = this.listaPrecio[indice];
      this.seleccionListaPrecio = codListaPrecio;
    }
  }
  cambioTipoPrecio(codTipoPrecio) {
    for (let indice = 0; indice < this.tipoPrecio.length; indice++) {
      if (this.tipoPrecio[indice].codTipoPrecio == this.seleccionTipoPrecio) {
        this.precio.tipoPrecio = this.tipoPrecio[indice];
      }
    }
  }

  cambioUnidad(codUnidad) {
    for (let indice = 0; indice < this.unidadMedida.length; indice++) {
      if (this.unidadMedida[indice].codUnidad == this.seleccionUnidad) {
        this.precio.unidadMedida = this.unidadMedida[indice];
        console.log(this.precio.unidadMedida);
      }
    }
  }

  mostrarFormulario() {
    this.cargarTipoPrecio();
    this.cargarUnidadMedida();
    this.modalFormulario = '';

  }

  cancelarModalFormulario() {
    this.modalFormulario = 'oculto';
  }

  async confirmarFormulario() {
    if (!this.precio.unidadMedida) {
      this.invalido('UNIDAD NO PUEDE SER NULL');
      return;
    }
    if (!this.precio.tipoPrecio) {
      this.invalido('TIPO NO PUEDE SER NULL');
      return;
    }
    for await (const item of this.preciosNoEncontrados) {
      let producto: Producto = await this.getProductoByCodErp(item.codigo);

      let precio: Precio = new Precio();
      precio.codPrecio = null;
      precio.codPrecioErp = producto.codProductoErp + '-' + this.seleccionListaPrecio;
      precio.codEmpresa = this._loginService.user.codEmpresa;
      precio.tipoPrecio = this.precio.tipoPrecio;
      precio.producto = producto;
      precio.unidadMedida = this.precio.unidadMedida;
      precio.cliente = null;
      precio.listaPrecio = this.precio.listaPrecio;
      precio.fechaDesde = this.precio.fechaDesde;
      precio.fechaHasta = this.precio.fechaHasta;
      precio.cantDesde = this.precio.cantDesde;
      precio.cantHasta = this.precio.cantHasta;
      precio.precio = item.precioNuevo;
      precio.activo = true;

      if (precio && precio.producto && precio.precio) {
        this.preciosACrear.push(precio);
      } else {
        this.invalido('producto o precio no valido en:' + item.codigo);
      }
    }
    this.modalFormulario = 'oculto';
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
    });
    Swal.showLoading();
    let nuevosPrecios: Precio[] = await this.crearPrecios();
    this.precios.splice(0, this.precios.length);
    this.preciosNoEncontrados.splice(0, this.preciosNoEncontrados.length);
    this.preciosEncontrados.splice(0, this.preciosEncontrados.length);
    this.preciosModificados = nuevosPrecios;
    Swal.close();
  }

  crearPrecios() {
    console.log(this.preciosACrear);
    let listado = this._precioService.crearPrecios(this.preciosACrear)
      .toPromise();
    return listado;
  }
  async getProductoByCodErp(cod: string) {
    let producto = this._productoServices.getProductoByCodErp(cod)
      .toPromise();
    return producto;
  }
}

