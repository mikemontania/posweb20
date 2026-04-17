import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { Cliente } from '../../models/cliente.model';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { ErrModel } from '../../models/ErrModel.model';
import { Usuarios } from '../../models/usuarios.model';
import { Sucursal } from '../../models/sucursal.model';
import { MotivoAnulacionService } from '../../services/motivoAnulacion/motivoAnulacion.service';
import { User } from '../../models/user.model';
import { LoginService, SucursalesService, UsuarioService, PedidosService, ExcelService, EmpresasService } from '../../services/service.index';
import { MotivoAnulacion } from '../../models/motivoAnulacion.model';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { Pedido } from '../../models/pedido.model';
import { PedidoDetalle } from '../../models/PedidoDetalle.model';
import { TotalModel } from '../../models/totalModel';
import { AbiOrdenService } from '../../services/abi-orden/abi-orden.service';
import { ABI_Pedido } from 'src/app/models/abi-pedido.model';
import { NroDocumento } from '../../components/nro-docu/nro-docu.component';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { BASE_URL } from 'src/app/config/config';
pdfMake.vfs = pdfFonts.pdfMake.vfs;


// guardarhistorial
interface PedidoStorage {
  fechaInicio: string;
  fechaFin: string;
  estado: any;
  cargadorCliente: Cliente;
  cargadorUsuario: Usuarios;
  cargadorSucursal: Sucursal;
  size: number;
  page: number;
}
interface OrdenAbi {
  orden_venta_id: number;
  punto_retiro_id: number;
  fecha_retiro: string;
}
@Component({
  selector: 'app-list-pedido',
  templateUrl: './pedidoLista.component.html',
  styles: [``]
})
export class PedidoListaComponent implements OnInit {
  reportePedidos: any[] = [];
  elementType = 'url';
  value: string = null;
  user: User;
  fechaRetiro: string;
  modal: string = 'oculto';
  modalQR: string = 'oculto';
  tamanhoPag: string = 'md';
  cargadorUsuario: Usuarios;
  cargadorCliente: Cliente;
  cargadorSucursal: Sucursal;
  sucursalreporte: Sucursal;
  confirmacionOrden: OrdenAbi;
  pedidoStorage: PedidoStorage = null; // guardarhistorial
  estados: any[] = [
    { id: 'CONCRETADO', descripcion: 'CONCRETADO' },
    { id: 'PENDIENTE', descripcion: 'PENDIENTE' },
    { id: 'ANULADO', descripcion: 'ANULADO' }];
  estado: string;

  objeto = { tipoPedido: '' };
  seleccionMotivo: number;
  size: number;
  empresa: any;
  codUsuario: number;
  codPedido: number;
  fechaInicio: string;
  fechafin: string;
  cliente: Cliente;
  usuario: Usuarios;
  sucursal: Sucursal;
  sinResultado: boolean = false;
  cargando: boolean = false;
  oculto1: string = 'oculto';
  oculto2: string = 'oculto';
  detalles: PedidoDetalle[] = [];
  sucursales: Sucursal[] = [];
  usuarios: Usuarios[] = [];
  cobranzaDetalles: CobranzaDetalle[] = [];
  motivosAnulacion: MotivoAnulacion[] = [];
  pedidoAuxiliar: Pedido;
  mAnulacion: MotivoAnulacion;
  pedidos: Pedido[] = [];
  paginador: any;
  errores: ErrModel[] = [];
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/pedidoLista/page';
  rutaDetalles: string = '/pedidoLista/id';
  codSucursal: number;
  modalAnulacion: string = 'oculto';
  modalFechaReal: string = 'oculto';
  seleccionUsuario: number;
  page: number = 0;
  rol: string;
  totalkg: number = 0;
  totalGs: number = 0;
  nroPedido: number = 0;
  tipoPedido: string = '';
  public numeros: ObjetoSelector[] = [
    { cod: 10, descripcion: '10', enum: '10' },
    { cod: 25, descripcion: '25', enum: '25' },
    { cod: 30, descripcion: '30', enum: '30' },
    { cod: 50, descripcion: '50', enum: '50' },
    { cod: 100, descripcion: '100', enum: '100' },
    { cod: 200, descripcion: '200', enum: '200' },
    { cod: 300, descripcion: '300', enum: '300' }
  ];

  constructor(private _pedidosService: PedidosService,
    public _loginServices: LoginService,
    public _excelService: ExcelService,
    public _empresasService: EmpresasService,
    public _abiServices: AbiOrdenService,
    private _AnulacionService: MotivoAnulacionService,
    private _sucursalesServices: SucursalesService,
    private _usuariosServices: UsuarioService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public http: HttpClient
  ) { }

  async ngOnInit() {
    await this.cargarEmpresas(this._loginServices.user.codEmpresa);
    this.nroPedido = 0;
    this.tipoPedido = '';
    this.totalkg = 0;
    this.totalGs = 0;
    this.codSucursal = 0;
    this.size = 300;
    this.estado = null;
    this.cargadorCliente = null;
    this.cargadorUsuario = null;
    this.cargadorSucursal = null;
    this.rol = this._loginServices.user.authorities[0];
    if (this.rol == 'ROLE_CAJERO') {
      this.codSucursal = this._loginServices.user.codSucursal;
      this.cargarSucursalPorId(this.codSucursal);
      this.cargarUsuarios(this.codSucursal);
    }
    this.codPedido = 0;
    console.log('rol,', this.rol);
    this.user = this._loginServices.user;
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.cargando = false;
    this.sinResultado = false;
    /******************storage */
    if (localStorage.getItem('pedidoStorage')) { // guardarhistorial
      this.pedidoStorage = JSON.parse(localStorage.getItem('pedidoStorage'));
      this.pagina = +localStorage.getItem('page');
      this.fechaInicio = this.pedidoStorage.fechaInicio,
        this.fechafin = this.pedidoStorage.fechaFin,
        this.estado = this.pedidoStorage.estado,
        this.cargadorCliente = this.pedidoStorage.cargadorCliente,
        this.cargadorUsuario = this.pedidoStorage.cargadorUsuario,
        this.cargadorSucursal = this.pedidoStorage.cargadorSucursal,
        this.size = this.pedidoStorage.size;
      this.page = this.pagina - 1;
      this.router.navigate([this.rutaPaginador, this.page]);
      this.loadPage(this.pagina);
    } else {
      this.router.navigate([this.rutaPaginador, this.page]);
      this.listar(this.page);
    }

    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, this.page]);
    this.activatedRoute.paramMap.subscribe(params => {
      this.page = +params.get('page');
      if (!this.page) {
        this.page = 0;
        this.router.navigate([this.rutaPaginador, this.page]);
      }
      this.listar(this.page);
    });
    /*=====================================================*/
  }
  cargarEmpresas(cod: any) {
    this._empresasService.traerEmpresasPorId(cod).subscribe((resp: any) => {
      console.log('respuesta', resp);
      this.empresa = resp;
      console.log(this.empresa)
    });
  }
  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }

  buscar() {
    this.pagina = 1;
    this.loadPage(1);
    this.page = 0;
    this.router.navigate([this.rutaPaginador, 0]);
    this.cargando = true;
    this.listar(0);
  }

  listar(page) {
    let codSucursal = 0;
    if (this.codSucursal) {
      codSucursal = this.codSucursal;
    }
    this._pedidosService.findByFecha(
      page,
      this.fechaInicio,
      this.fechafin,
      this.cargadorCliente,
      this.cargadorUsuario,
      codSucursal,
      this.size,
      this.estado, null, this.tipoPedido, this.nroPedido
    )
      .subscribe(async (r: any) => {
        console.log(r.content);
        this.pedidos = r.content as Pedido[];
        this.paginador = r;
        this.totalElementos = r.totalElements;
        this.cantidadElementos = r.size;
        localStorage.removeItem('pedidoStorage'); // guardarhistorial
        localStorage.removeItem('page'); // guardarhistorial
        let traerTotales: TotalModel = await this.findTotal();
        this.totalGs = traerTotales.totalGs;
        this.totalkg = traerTotales.totalKg;
        console.log('traerTotales', traerTotales);
        if (this.paginador.empty === true) {
          this.sinResultado = true;
          this.pedidos = [];
          this.cargando = false;
        } else {
          this.cargando = false;

        }
      });
  }


  async reporteExcel(): Promise<void> {
    if (this.pedidos.length === 0) {
      this.invalido('No se puede exportar datos de la nada!!!');
      return;
    }

    // Mostrar Swal de carga
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
    });
    Swal.showLoading();

    try {
      const pedidosConDetalles = await Promise.all(
        this.pedidos.map(async (p) => {
          try {
            if (p.anulado) {
              return undefined; // explícitamente undefined
            }

            const data: any = await this._pedidosService.getById(p.codPedido).toPromise();

            const detallesTexto = (data.pedido.detalle || [])
              .map((d: any) => `${d.cantidad} : ${d.producto?.nombreProducto || 'Sin nombre'}`)
              .join(' | ');

            return {
              NroReferencia: p.codPedido,
              NroDocumento: p.cliente.docNro,
              telefono: p.cliente.telefono,
              Direccion: p.cliente.direccion,
              Nombre: p.cliente.razonSocial,
              Gestion: 'Entrega Puerta a Puerta',
              ObsCliente: p.cliente.obs,
              Barrio: '',
              Referencia: '',
              InformacionAdicc: p.observacion,
              cantidadPaquetes: 1,
              ubicacion: '',
              totalACobrar: p.importeTotal,
              tipoPago: p.cliente.medioPagoPref?.descripcion || 'Efectivo',
              Productos: detallesTexto,
            };
          } catch (err) {
            console.error(`Error al obtener detalles del pedido ${p.codPedido}`, err);
            return null;
          }
        })
      );

      // Filtrar nulos y undefineds
      const pedidosValidos = pedidosConDetalles.filter(p => p != null);
      console.log(pedidosValidos)
      // Exportar
      this._excelService.exportAsExcelFile(pedidosValidos, 'pedidos-con-detalles');

    } catch (err) {
      console.error('Error general en el proceso de exportación', err);
      Swal.fire('Error', 'Ocurrió un error al generar el Excel.', 'error');
      return;
    } finally {
      Swal.close();
    }
  }
  async getSucursalbyId(id: number) {
    let sucursal = this._sucursalesServices.getSucursalbyId(id).toPromise();
    return sucursal;
  }

  private getBase64FromImage(img: string): Promise<string> {
    const url = `${BASE_URL}empresas/download-image/${img}`;

    return this.http.get(url, { responseType: 'blob' }).toPromise().then(blob => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob); // ✅ esto da el base64
      });
    });
  }
  async reportePDF(): Promise<void> {
    if (this.pedidos.length === 0) {
      this.invalido('No se puede exportar datos de la nada!!!');
      return;
    }

    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
    });
    Swal.showLoading();

    try {
      const pedidosConDetalles = await Promise.all(
        this.pedidos.map(async (p) => {
          if (p.anulado) return null;

          const data: any = await this._pedidosService.getById(p.codPedido).toPromise();
          const detallesTexto = (data.pedido.detalle || [])
            .map((d: any) => `${d.cantidad} : ${d.producto?.nombreProducto || 'Sin nombre'}`)
            .join(' | ');
          const sucursal = await this.getSucursalbyId(p.codSucursal);
          return {
            telSucursal: sucursal.telefono,
            NroReferencia: p.codPedido,
            telefono: p.cliente.telefono,
            Direccion: p.cliente.direccion,
            Nombre: p.cliente.razonSocial,
            NroDocumento: p.cliente.docNro,
            Gestion: 'Entrega Puerta a Puerta',
            ObsCliente: p.cliente.obs,
            InformacionAdicc: p.observacion,
            cantidadPaquetes: 1,
            totalACobrar: p.importeTotal,
            tipoPago: p.cliente.medioPagoPref?.descripcion || 'Efectivo',
            Productos: detallesTexto,
          };
        })
      );

      const pedidosValidos = pedidosConDetalles.filter(p => p != null);

      const img = this.empresa.img || this.sinImagen;
      const logoBase64 = await this.getBase64FromImage(img); // ✅ Aquí obtenés el base64
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: pedidosValidos.map(p => ({
          table: {
            widths: ['*'],
            body: [[
              {
                stack: [
                  {
                    image: logoBase64,
                    width: 150,
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                  },
                  {
                    text: `Suc Tel: ${p.telSucursal}`,
                    fontSize: 20,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 10]
                  },
                  {
                    text: `Pedido N° ${p.NroReferencia}`,
                    fontSize: 20,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 10]
                  },
                  {
                    text: [
                      { text: 'Cliente: ', bold: true },
                      p.Nombre
                    ],
                    fontSize: 14,
                    alignment: 'center'
                  },
                  {
                    text: [
                      { text: 'Documento: ', bold: true },
                      p.NroDocumento
                    ],
                    fontSize: 14,
                    alignment: 'center'
                  },
                  {
                    text: [
                      { text: 'Teléfono: ', bold: true },
                      p.telefono
                    ],
                    fontSize: 14,
                    alignment: 'center'
                  },
                  {
                    text: [
                      { text: 'Dirección: ', bold: true },
                      p.Direccion
                    ],
                    fontSize: 14,
                    alignment: 'center',
                    margin: [0, 0, 0, 10]
                  },
                  {
                    text: [
                      { text: 'Ciudad: ', bold: true },
                      p.ObsCliente,
                    ],
                    fontSize: 14,
                    alignment: 'center',
                    margin: [0, 0, 0, 10]
                  },

                  {
                    text: [
                      { text: 'Pago: ', bold: true },
                      p.tipoPago,
                      { text: ` | Total: ${Number(p.totalACobrar).toLocaleString()} Gs`, bold: true }
                    ],
                    fontSize: 14,
                    alignment: 'center'
                  },
                  {
                    text: [
                      { text: 'Productos: ', bold: true },
                      p.Productos
                    ],
                    fontSize: 14,
                    alignment: 'center',
                    margin: [0, 10, 0, 0]
                  }
                ],
                margin: [50, 0, 50, 0]
              }
            ]]
          },
          layout: 'noBorders',
          height: '100%', // fuerza altura completa para ayudar a centrar
          alignment: 'center',
          pageBreak: 'after'
        }))
      };



      pdfMake.createPdf(docDefinition).open();

    } catch (err) {
      console.error('Error al generar PDF', err);
      Swal.fire('Error', 'Ocurrió un error al generar el PDF.', 'error');
    } finally {
      Swal.close();
    }
  }


  async export(): Promise<void> {
    if (this.pedidos.length === 0) {
      this.invalido('No se puede exportar datos de la nada!!!');
      return;
    }

    // Paso 1: Obtener todos los pedidos con detalles usando Promise.all
    const pedidosConDetalles = await Promise.all(
      this.pedidos.map(async (p) => {
        try {
          const response: any = await this._pedidosService.getById(p.codPedido).toPromise();

          const detallesTexto = (response.detalle || [])
            .map((d: any) => `${d.cantidad} : ${d.producto?.nombreProducto || 'Sin nombre'}`)
            .join(' | ');

          return {
            NroReferencia: p.codPedido,
            NroDoc: '',
            direccion: p.cliente.direccion,
            nombre: p.cliente.razonSocial,
            gestion: 'Entrega Puerta a Puerta',
            obsCliente: p.cliente.obs,

            observacion: p.observacion,
            cantidadPaquetes: 1,

            tipoDoc: p.cliente.tipoDoc,
            docNro: p.cliente.docNro,

            telefono: p.cliente.telefono,

            email: p.cliente.email,
            latitud: p.cliente.latitud,
            longitud: p.cliente.longitud,
            detallesTexto,
          };
        } catch (err) {
          console.error(`Error al obtener detalles del pedido ${p.codPedido}`, err);
          return null; // o podés filtrar después los nulls
        }
      })
    );

    // Filtrar nulos por si algún pedido falló
    const pedidosValidos = pedidosConDetalles.filter(p => p !== null);

    // Paso 2: Exportar a Excel
    this._excelService.exportAsExcelFile(pedidosValidos, 'pedidos-con-detalles');
  }



  verTodos() {
    this.cargadorCliente = null;
    this.cargadorUsuario = null;
    this.cargadorSucursal = null;
    this.estado = null;
    this.fechaInicio = moment('2019-01-01').format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.listar(0);
  }



  cambioNumero(EVENTO) {
    this.size = EVENTO;
  }


  editar(param) {// guardarhistorial
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
      }
      localStorage.setItem('page', JSON.stringify(page + 1));
      console.log('page', page);
    });
    this.pedidoStorage = {
      page: 0,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechafin,
      estado: this.estado,
      cargadorCliente: this.cargadorCliente,
      cargadorUsuario: this.cargadorUsuario,
      cargadorSucursal: this.cargadorSucursal,
      size: this.size
    };

    localStorage.setItem('pedidoStorage', JSON.stringify(this.pedidoStorage));
    this.router.navigate([this.rutaDetalles, param]);
  }



  async traerMotrivosAnul() {
    let res = this._AnulacionService.traerByCodEmp(this.user.codEmpresa)
      .toPromise();
    return res;
  }

  async mostrarModalAnulacion(pedido) {
    this.codPedido = pedido.codPedido;
    this.pedidoAuxiliar = pedido;
    this.motivosAnulacion = await this.traerMotrivosAnul();
    this.modalAnulacion = '';
    console.log(this.motivosAnulacion);
  }
  cerrarModalAnulacion() {
    this.pedidoAuxiliar = null;
    this.modalAnulacion = 'oculto';
    this.seleccionMotivo = 0;
    this.mAnulacion = null;
  }


 async mostrarModalFechaReal(pedido) {
    this.codPedido = pedido.codPedido;
    this.pedidoAuxiliar = pedido;
    this.modalFechaReal = '';
  }
  cerrarFechaReal() {
    this.pedidoAuxiliar = null;
    this.modalFechaReal = 'oculto';
  }
UpdateFechaReal(){

      Swal.fire({
        title: 'Está seguro?',
        text: `¿Seguro que desea modificar la fecha real el pedido?`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, Modificar!',
        cancelButtonText: 'No, cancelar!',
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false,
        reverseButtons: true
      })


.then(async (result) => {
        if (result.value) {

          let update = await this.updateFechaRealProm(this.codPedido, this.pedidoAuxiliar.fechaPedidoReal);
           this.codPedido = 0;
          this.modalFechaReal = 'oculto';
          swal.fire('Actualizado ', 'Pedido actualizado con exito', 'success');
          this.seleccionMotivo = 0;
        }
      });





}


async enviarAnulacion() {
  if (!this.pedidoAuxiliar || this.pedidoAuxiliar.anulado === true) {
    this.invalido('El pedido ya se encuentra anulado');
    return;
  }

  // Si el usuario es VENDEDOR, solo puede anular sus propios pedidos
  if (this._loginServices.user.authorities[0] === 'ROLE_VENDEDOR' &&
      this.pedidoAuxiliar.codUsuarioCreacion !== this._loginServices.user.codUsuario) {
    this.invalido('No tiene permiso para realizar la anulación !!!');
    return;
  }

  Swal.fire({
    title: 'Está seguro?',
        text: `¿Seguro que desea anular el pedido?`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, anular!',
        cancelButtonText: 'No, cancelar!',
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false,
        reverseButtons: true
  }).then(async (result) => {
    if (result.value) {
      if (!this.mAnulacion) {
        this.invalido('Debe seleccionar motivo de anulación');
        return;
      }

      this._pedidosService.anular(this.codPedido, this.mAnulacion).subscribe({
        next: (resp) => {
          console.log(resp);
          this.codPedido = 0;
          this.modalAnulacion = 'oculto';
          Swal.fire('Pedido anulado', 'El pedido se anuló con éxito', 'success');
          this.seleccionMotivo = 0;
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', err?.error?.mensaje || 'No se pudo anular el pedido', 'error');
        }
      });
    }
  });
}



  seleccionarUsuario(item: Usuarios) {
    this.usuario = item;
    this.cargadorUsuario = item;
  }

  seleccionarCliente(item: Cliente) {
    this.cliente = item;
    this.cargadorCliente = item;
  }
  seleccionarSucursal(item: Sucursal) {
    this.sucursal = item;
    this.cargadorSucursal = item;
    (this.cargadorSucursal) ? this.codSucursal = this.cargadorSucursal.codSucursal : 0;
  }
  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }


  async anularPedido(codPedido, mAnulacion) {
    let res = this._pedidosService.anular(codPedido, mAnulacion)
      .toPromise();
    return res;
  }
  async updateFechaRealProm(codPedido, fecha) {
    let res = this._pedidosService.updateFechaReal(codPedido, fecha)
      .toPromise();
    return res;
  }
  mostrarModal(pedido: Pedido) {
    this.modal = '';
    this.confirmacionOrden = null;
    this.confirmacionOrden = {
      orden_venta_id: pedido.codOrdenAbi,
      punto_retiro_id: pedido.codPuntoRetiro,
      fecha_retiro: null,
    }
    // this._AnulacionService.traerByCodEmp(this.user.codEmpresa)
    //   .subscribe((r: any) => {
    //     this.motivosAnulacion = r as MotivoAnulacion[];
    //     this.modal = '';
    //     console.log(this.motivosAnulacion);
    //     return;
    //   });
  }

  mostrarModalQr(pedido: Pedido) {
    this.modalQR = '';
    this.value = pedido.contrasena;

  }

  cerrarModalQr() {
    this.modalQR = 'oculto';
    this.value = null;
  }

  async enviar() {
    if (!this.fechaRetiro) {
      this.invalido('Debe seleccionar motivo de anulación');
      return;
    }
    this.confirmacionOrden.fecha_retiro = moment(new Date(this.fechaRetiro)).format();
    this._abiServices.aprobarOrden(this.confirmacionOrden).subscribe(
      j => {
        this._pedidosService.confirmarFechaRetiro(this.confirmacionOrden.orden_venta_id, this.confirmacionOrden.fecha_retiro).subscribe(
          async json => {
            this.modal = 'oculto';
            let orden = await this.getOrdenById(this.confirmacionOrden.orden_venta_id);
            if (orden) {
              console.log(orden);
              this._pedidosService.updateContrasena(this.confirmacionOrden.orden_venta_id, orden.contrasena).subscribe(
                o => {
                  Swal.fire('Ok', 'Se ha confirmado fecha retiro', 'success');
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
            } else {
              Swal.fire('Atencion', 'No se pudo guardar contraseña', 'success');
            }
          },
          err => {
            if (!err.error) {
              this.modal = 'oculto';
              this.error('500 (Internal Server Error)');
              return;
            }
            this.errores = err.error.errors;
            console.error('Código del error desde el backend: ' + err.status);
          }
        );
      },
      err => {
        if (!err.error) {
          this.modal = 'oculto';
          this.error('500 (Internal Server Error)');
          return;
        }
        this.errores = err.error.errors;
        console.error('Código del error desde el backend: ' + err.status);
      }
    )

  }

  getOrdenById(orden_venta_ido) {
    let orden = this._abiServices.getOrdenById(orden_venta_ido).toPromise();
    return orden;
  }

  updateContrasena(orden_venta_id, contrasena) {
    let pedido = this._pedidosService.updateContrasena(orden_venta_id, contrasena).toPromise();
    return pedido;
  }
  updatePedidoFecha(orden_venta_id, fecha_retiro) {
    let pedido = this._pedidosService.confirmarFechaRetiro(orden_venta_id, fecha_retiro).toPromise();
    return pedido;
  }
  cerrarModal() {
    this.modal = 'oculto';
  }


  cambioTerminal(event) {
    for (let indice = 0; indice < this.motivosAnulacion.length; indice++) {           // tslint:disable-next-line:triple-equals
      if (this.motivosAnulacion[indice].codMotivoAnulacion == this.seleccionMotivo) {
        this.mAnulacion = this.motivosAnulacion[indice];
      }
    }
  }
  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido', { timeOut: 2200 });
    Swal.fire('Atención', invalido, 'warning');
  }




  cambioSucursal(EVENTO) {
    this.codSucursal = EVENTO;
    this.codUsuario = 0;
    this.seleccionUsuario = 0;
    if (this.codSucursal > 0) {
      this.cargarUsuarios(this.codSucursal);
    }

  }
  cambioUsuario(id) {
    this._usuariosServices.getUsuario(id).subscribe(cargadorUsuario => {
      this.cargadorUsuario = cargadorUsuario;
    });
  }
  clean() {
    this.estado = '';
    this.buscar();
  }
  cambioEstado(estado) {
    if (estado) {
      this.estado = estado.id;
    } else {
      this.estado = '';
    }
    this.buscar();
  }
  cargarSucursalPorId(codSuc) {
    this._sucursalesServices.getSucursalbyId(codSuc).subscribe(sucursal => {
      this.sucursales.push(sucursal);
      this.cargadorSucursal = sucursal;
    });
  }
  cargarSucursalReporte(codSuc: number) {
    this._sucursalesServices.getSucursalbyId(codSuc).subscribe(sucursal => {
      this.sucursales.push(sucursal);
      this.cargadorSucursal = sucursal;
    });
  }

  cargarUsuarios(codSucursal) {
    this._usuariosServices.traerUsuariosPorSucursal(codSucursal).subscribe(usuarios => {
      let auxus: Usuarios = {
        enabled: true,
        codUsuario: 0,
        nombrePersona: 'TODOS',
        codPersonaErp: '8554',
        username: 'todos@cavallaro.com.py',
        rol: null,
        codEmpresa: 1,
        sucursal: null,
        intentoFallido: 0,
        bloqueado: false,
        createdAt: null,
        modifiedAt: null,
        createdBy: 'todos@todos.com',
        modifiedBy: 'admin@admin.com',
        img: '',
      };

      this.usuarios = usuarios;
      this.usuarios.push(auxus);
      this.codUsuario = 0;
      this.seleccionUsuario = 0;

    });
  }

  async cargarSucursalById(cod) {
    let sucursal = this._sucursalesServices.getSucursalbyId(cod).toPromise();
    return sucursal;
  }

  async traerModeloPorId(cod) {
    let response = this._pedidosService.getById(cod).toPromise();
    return response;
  }
  async findTotal() {
    let response = this._pedidosService.findTotal(
      this.fechaInicio,
      this.fechafin,
      this.cargadorCliente,
      this.cargadorUsuario,
      (this.codSucursal) ? this.codSucursal : 0,
      null,
      this.tipoPedido,
      this.nroPedido
    ).toPromise();
    return response;
  }

}
