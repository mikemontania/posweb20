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

interface ExcelAbiStock {
  id: number;
  api_extra_data: string;
  nombre: string;
  descripcion: string;
  cantidad_disponible: number;
}
interface ExcelListaStockNuevo {
  codigo: string;
  cantidad_disponible: number;
}
interface ExcelListaStock {
  id: number;
  cantidad_disponible: number;
}
@Component({
  selector: 'app-abi-stock',
  templateUrl: './abi-stock.component.html',
  styles: []
})
export class ABIStockComponent implements OnInit {
  precio: Precio = new Precio();
  modalFormulario: string = 'oculto';
  excel: string = './assets/images/excel.png';
  sinImagen: string = './assets/images/sin-imagen.jpg';
  editable: boolean = false;
  archivo: File;
  productos: ABI_Producto[] = [];
  reporte: ExcelAbiStock[] = [];
  stocksModificados: ExcelListaStock[] = [];
  stocksEncontrados: ExcelListaStockNuevo[] = [];
  stocksNoEncontrados: ExcelListaStockNuevo[] = [];
  stocks: ExcelListaStock[] = [];
  unidadMedida: UnidadMedida[] = [];
  tipoPrecio: TipoPrecio[] = [];
  seleccionUnidad: number;
  seleccionTipoPrecio: number;
  listaPrecio: ListaPrecio[] = [];
  seleccionListaPrecio: number;
  user: User;
  willDownload = false;
  array: any[] = [];
  data: any = [[1, 2], [4, 5]];
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
    this.stocks = [];
    this.stocksModificados = [];
    this.stocksEncontrados = [];
    this.stocksNoEncontrados = [];
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
      let cantidad_disponible = hoja.B1.h;
       let codigocsv = hoja.A1.v;
      let cantidad_disponiblecsv = hoja.B1.v;
       if (codigo != 'codigo' && codigocsv != 'codigo') {
        console.log('codigo', codigo);
        this.invalido('Verifique el campo codigo');
        return;
      }
      if (cantidad_disponible != 'cantidad_disponible' && cantidad_disponiblecsv != 'cantidad_disponible') {
        console.log('cantidad_disponible', cantidad_disponible);
        this.invalido('Verifique el campo cantidad_disponible');
        return;
      }
      this.data = <any>(XLSX.utils.sheet_to_json(hoja, { header: 2 }));
      this.stocksEncontrados=[]
      this.stocksNoEncontrados=[];
      this.stocks=[];
      this.cargarArray();
    };
    reader.readAsBinaryString(target.files[0]);
  }

  

  async cambiarStock() {
    console.log(this.stocks)
  //  return this.stocks;
     let stocks = this._abiOrdenServices.ActualizarStock(this.stocks)
       .toPromise();
     console.log(stocks)
      return stocks;
  }

  cambioPrecios() {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que modificar ${this.stocksEncontrados.length} stocks de la lista ?`,
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
        let stocks = await this.cambiarStock();
        this.stocksModificados = stocks;
        this.stocksModificados.sort(function (a, b) {
          return +a.id - +b.id;
        });
        this.stocks = [];
        this.stocksEncontrados = [];
        this.stocksNoEncontrados = [];
        Swal.close();
        Swal.fire(
          'Stocks modificados!',
          `${stocks.length} stocks modificados con éxito.`,
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
        let precio: ExcelListaStock = {
          id: producto[0].id,
          cantidad_disponible: element.cantidad_disponible 
        }
        let precioEncontrado: ExcelListaStockNuevo = {
          codigo: producto[0].api_extra_data,
          cantidad_disponible: producto[0].cantidad_disponible
        }
        this.stocksEncontrados.push(precioEncontrado);
        console.log(precio);
        this.stocks.push(precio);
      }else{
        let precioNoEncontrado: ExcelListaStockNuevo = {
          codigo: element.codigo,
          cantidad_disponible: 0
        }
        this.stocksNoEncontrados.push(precioNoEncontrado);
      }
    });
  }




  async export(): Promise<void> {
    this.reporte = [];
    if (this.productos.length > 0) {
      for await (const p of this.productos) {
        let item: ExcelAbiStock = {
          id: p.id,
          api_extra_data: p.api_extra_data,
          nombre: p.nombre,
          descripcion: p.descripcion,
          cantidad_disponible: p.cantidad_disponible 
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

