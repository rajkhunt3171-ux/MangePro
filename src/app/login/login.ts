import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { loginReq, loginRes } from './login.model';
import { SharedService } from '../shared/service/shared-service';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {

  loginReq = new loginReq();
  loginRes = new loginRes();

  constructor(
    public sharedService: SharedService,
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  login() {
    this.loginService.login(this.loginReq).subscribe({
      next: (res) => {
        localStorage.setItem('authToken', res.token);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Login error', error);
      }
    });
  }
}
