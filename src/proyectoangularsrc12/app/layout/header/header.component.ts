import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SidebarService, UsuarioService, EmpresasService, PedidosService } from '../../services/service.index';
import { User } from '../../models/user.model';
import { Empresas } from '../../models/empresas.model';
import { LoginService } from '../../services/login/login.service';
import { Pedido } from '../../models/pedido.model';
import { Subscription } from 'rxjs';
import { TerminalVenta } from '../../models/terminalVenta.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent implements OnInit, OnDestroy {
  public subscription: Subscription;
 
  pendientes: Pedido[] = [];
  sinImagen: string = './assets/images/users/user_img.png';
  imagenEmpresa: string = './assets/images/logo-text.png';
  constructor(
    public _loginService: LoginService,
    public _usuarioService: UsuarioService,
    public _pedidosService: PedidosService
  ) { }

  ngOnChanges(){
    if (this._loginService.terminal.codTerminalVenta == 0) {
      setInterval(() => {
        this._loginService.cargarTerminal();

      },1000);
    }else{
      let terminaUUI = localStorage.getItem('tv');
      this._loginService.terminal = JSON.parse(window.atob(terminaUUI));
    }
  }


  async ngOnInit() {
    if (this._loginService.user.authorities[0] == 'ROLE_CAJERO' || this._loginService.user.authorities[0] == 'ROLE_ADMIN') {
      this.pendientes = await this.findPendientes();
      setInterval(() => {
        this.subscription = this._pedidosService
          .findPendientes((this._loginService.user.authorities[0] == 'ROLE_CAJERO') ? this._loginService.user.codSucursal : 0)
          .subscribe(pendientes => {
            console.log('pendientes', pendientes);
            if (pendientes) {
              this.pendientes = pendientes;
            }
          });
      }, 900000);
    }

    if (this._loginService.terminal.codTerminalVenta == 0) {
      setInterval(() => {
        this._loginService.cargarTerminal();

      },1000);
    }else{
      let terminaUUI = localStorage.getItem('tv');
      this._loginService.terminal = JSON.parse(window.atob(terminaUUI));
    }


    setTimeout(() => {
      this.cargar();
    }, 200);
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

     
  }
  cargar() {
    this._usuarioService.getUsuarioByIdForImg(this._loginService.user.codUsuario).subscribe(us => {
      console.log(us);
      this._loginService.user.img = us.img;
      console.log('_LOGIN', this._loginService.user);
    });
  }


  async actualizarPendientes() {
    this.pendientes = await this.findPendientes();
  }

  async findPendientes() {
    let pendientes = this._pedidosService
      .findPendientes((this._loginService.user.authorities[0] == 'ROLE_CAJERO') ? this._loginService.user.codSucursal : 0).toPromise();
    return pendientes;
  }


}
