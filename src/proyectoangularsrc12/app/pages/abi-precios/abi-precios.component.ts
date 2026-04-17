import { Component, OnInit } from '@angular/core';
import { AbiOrdenService, ClienteService, ExcelService, TipoPrecioService, UnidadMedidaService } from '../../services/service.index';
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
import { AbiProductoService } from '../../services/abi-producto/abi-producto.service';
import { ABI_Producto } from '../../models/abi-producto.model';

interface ExcelPrecio {
  codigo: string;
  encontrado: boolean;
  precioActual: number;
  precioNuevo: number;
  producto: string;
  codProducto: number;
}
interface ExcelAbiPrecios {
  id: number;
  api_extra_data: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_mayorista: number;
}
interface ExcelListaPreciosNuevos {
  codigo: string;
  precio: number;
  precio_mayorista: number;
}
interface ExcelListaPrecios {
  id: number;
  precio: number;
  precio_mayorista: number;
}
@Component({
  selector: 'app-abi-precios',
  templateUrl: './abi-precios.component.html',
  styles: []
})
export class ABIPreciosComponent implements OnInit {
  precio: Precio = new Precio();
  modalFormulario: string = 'oculto';
  excel: string = './assets/images/excel.png';
  sinImagen: string = './assets/images/sin-imagen.jpg';
  editable: boolean = false;
  archivo: File;
  productos: ABI_Producto[] = [];
  reporte: ExcelAbiPrecios[] = [];
  preciosModificados: ExcelListaPrecios[] = [];
   preciosEncontrados: ExcelListaPreciosNuevos[] = [];
  preciosNoEncontrados: ExcelListaPreciosNuevos[] = [];
  precios: ExcelListaPrecios[] = [];
  unidadMedida: UnidadMedida[] = [];
  tipoPrecio: TipoPrecio[] = [];
  seleccionUnidad: number;
  seleccionTipoPrecio: number;
  listaPrecio: ListaPrecio[] = [];
  seleccionListaPrecio: number;
  user: User;
  willDownload = false;
  array: any[] = [];
  data: any = [[1, 2, 3], [4, 5, 6]];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'SheetJS.xlsx';
  constructor(
    private _abiProductoServices: AbiProductoService,
    public _excelService: ExcelService,
    private _productoServices: ProductoService,
    private _abiOrdenServices: AbiOrdenService,
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

  async ngOnInit() {
    this.editable = true;
    this.seleccionListaPrecio = 0;
    this.productos = await this.getProductos();
    this.precios = [];
    this.preciosModificados = [];
    this.preciosEncontrados = [];
    this.preciosNoEncontrados = [];
    $('#uploadedfile').val(null);

  }



  async getProductos() {
    let productos = this._abiOrdenServices.getProductos().toPromise();
    return productos;
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
      let precio_mayorista = hoja.C1.h;
      let codigocsv = hoja.A1.v;
      let preciocsv = hoja.B1.v;
      let precioMayoristacsv = hoja.B1.v;
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
      if (precio_mayorista != 'precio_mayorista' && precioMayoristacsv != 'precio_mayorista') {
        console.log('precio_mayorista', precio_mayorista);
        this.invalido('Verifique el campo precio_mayorista');
        return;
      }
      this.data = <any>(XLSX.utils.sheet_to_json(hoja, { header: 2 }));
      this.preciosEncontrados=[]
      this.preciosNoEncontrados=[];
      this.precios=[];
      this.cargarArray();
    };
    reader.readAsBinaryString(target.files[0]);
  }

  

  async cambiarPrecios() {
    console.log(this.precios)
  //  return this.precios;
      let precios = this._abiOrdenServices.ActualizarPrecios(this.precios)
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
        Swal.fire({
          allowOutsideClick: false,
          type: 'info',
          text: 'Espere por favor...',
        });
        Swal.showLoading();
        let pre = await this.cambiarPrecios();
        this.preciosModificados = pre;
        this.preciosModificados.sort(function (a, b) {
          return +a.id - +b.id;
        });
        this.precios = [];
        this.preciosEncontrados = [];
        this.preciosNoEncontrados = [];
        Swal.close();
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
     //let precioNuevo = +element.precio.replace(',', '');
     // let precioMAyoristaNuevo =+element.precio_mayorista.replace(',', '');
      let producto: ABI_Producto[] = await this.productos.filter(p => p.api_extra_data == element.codigo);
      if (producto) {
        let precio: ExcelListaPrecios = {
          id: producto[0].id,
          precio: element.precio,
          precio_mayorista: element.precio_mayorista
        }
        let precioEncontrado: ExcelListaPreciosNuevos = {
          codigo: producto[0].api_extra_data,
          precio: producto[0].precio,
          precio_mayorista: producto[0].precio_mayorista
        }
        this.preciosEncontrados.push(precioEncontrado);
        console.log(precio);
        this.precios.push(precio);
      }else{
        let precioNoEncontrado: ExcelListaPreciosNuevos = {
          codigo: element.codigo,
          precio: 0,
          precio_mayorista: 0
        }
        this.preciosNoEncontrados.push(precioNoEncontrado);
      }
    });
  }




  async export(): Promise<void> {
    this.reporte = [];
    if (this.productos.length > 0) {
      for await (const p of this.productos) {
        let item: ExcelAbiPrecios = {
          id: p.id,
          api_extra_data: p.api_extra_data,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          precio_mayorista: p.precio_mayorista
        }
        console.log(item);
        this.reporte.push(item);
      }
      this._excelService.exportAsExcelFile(this.reporte, 'xlsx');
    } else {
      this.invalido('No se puede exportar datos de la nada!!!');
    }
  }
}

