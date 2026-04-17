import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { CategoriaService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { User } from '../../models/user.model';
  import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { Stock } from '../../models/stock.model';
import { StockService } from '../../services/stock/stock.service';
import { Deposito } from '../../models/deposito.model';
import { Producto } from '../../models/producto.model';
import { UnidadMedida } from '../../models/unidadMedida.model';


@Component({
  selector: 'app-form-stock',
  templateUrl: './form-stock.component.html',
  styles: []
})
export class FormStockComponent implements OnInit {
  cliente: Cliente;
  stock: Stock = new Stock();
  cargadorDeposito: Deposito;
  cargadorUnidad: UnidadMedida;
  cargadorProducto: Producto;
  sinImagen: string = './assets/images/sin-imagen.jpg';
  user: User;
  constructor(
    private _categoriaServices: CategoriaService,
    private toastr: ToastrService,
    private _loginService: LoginService,
    private _stockService: StockService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.stock.codStock = null;
    this.stock.codEmpresa = null;
    this.stock.codSucursal = null;
    this.stock.deposito = null;
    this.stock.unidadMedida = null;
    this.stock.producto = null;
    this.stock.comprometido = 0;
    this.stock.existencia = 0;
    this.stock.minimo = 0;
  }

  ngOnInit() {
    this.user = this._loginService.user;

    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._stockService.getById(id).subscribe((stock) => {
          this.stock = stock;
          if (stock) {
            this.cargadorDeposito = this.stock.deposito;
            this.cargadorProducto = this.stock.producto;
            this.cargadorUnidad = this.stock.unidadMedida;
          }
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
    if (!this.stock.unidadMedida) {
      this.invalido('Unidad de medida no puede ser nulo');
      return;
    }
    if (!this.stock.producto) {
      this.invalido('producto  no puede ser nulo');
      return;
    }
    if (!this.stock.deposito) {
      this.invalido('stock no puede ser nulo');
      return;
    } else {
      this.stock.codEmpresa = this.cargadorDeposito.codEmpresa;
      this.stock.codSucursal = this.cargadorDeposito.sucursal.codSucursal;
    }
    console.log(this.stock);
    this._stockService.create(this.stock)
      .subscribe(
        (stock: Stock) => {
          this.router.navigate(['/stock']);
          swal.fire('Nuevo Stock Producto', `El producto ${this.stock.producto.nombreProducto} ha sido creado con éxito`, 'success');
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
    if (!this.stock.unidadMedida) {
      this.invalido('Unidad de medida no puede ser nulo');
      return;
    }
    if (!this.stock.producto) {
      this.invalido('producto  no puede ser nulo');
      return;
    }
    if (!this.stock.deposito) {
      this.invalido('stock no puede ser nulo');
      return;
    }

    console.log(this.stock);
    this._stockService.update(this.stock)
      .subscribe(
        (json: Stock) => {
          this.router.navigate(['/stock']);

          swal.fire('Stock Producto S Actualizado', `Producto  : ${json.producto.nombreProducto}`, 'success');
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


  seleccionarDeposito(item: Deposito) {
    if (item) {
      console.log(item);
      this.cargadorDeposito = item;
      this.stock.deposito = item;
      console.log(this.cargadorDeposito);
    } else {
      this.cargadorDeposito = null;
    }
  }

  seleccionarProducto(item: Producto) {
    if (item) {
      console.log(item);
      this.cargadorProducto = item;
      this.stock.producto = item;
      console.log(this.cargadorProducto);
    } else {
      this.cargadorProducto = null;
    }
  }

  seleccionarUnidad(item: UnidadMedida) {
    if (item) {
      console.log(item);
      this.cargadorUnidad = item;
      this.stock.unidadMedida = item;
      console.log(this.cargadorUnidad);
    } else {
      this.cargadorUnidad = null;
    }
  }

}
