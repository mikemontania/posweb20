import { NgForm } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { User } from '../../models/user.model';
import { LoginService } from '../../services/login/login.service';
import Swal from 'sweetalert2';

declare function init_plugins();
declare const gapi: any;


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  recuerdame: boolean = false;

  auth2: any;

  constructor(
    public router: Router,

    public _loginService: LoginService
  ) { }

  ngOnInit() {
    init_plugins();
    /*   this.googleInit(); */

    this.username = localStorage.getItem('username') || '';
    if (this.username.length > 1) {
      this.recuerdame = true;
    }

  }

  ingresar(forma: NgForm) {
    if (forma.invalid) {
      return;
    }
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading();

    let user = new User(null, null, null, null, null, null, forma.value.username, forma.value.password, null, null, null, null, null);
    this._loginService.login(user, forma.value.recuerdame)
      .subscribe(correcto => {
        this.router.navigate(['/dashboard']);
        Swal.close();
      });
  }

}
