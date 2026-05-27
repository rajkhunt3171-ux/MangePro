import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { loginReq, loginRes } from './login.model';
import { SharedService } from '../shared/service/shared-service';
import { LoginService } from './login.service';
import { Headers } from '../shared/component/header/headers';
import { SocketService } from '../shared/service/socket-service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {

  loginReq = new loginReq();
  loginRes = new loginRes();
  selectedDepartment = 0;

  departments = [
    { label: 'Admin', value: 0 },
    { label: 'Doctor', value: 1 }
  ];

  constructor(
    public sharedService: SharedService,
    private loginService: LoginService,
    private router: Router,
    private headersService: Headers,
    private socketService: SocketService
  ) { }

  ngOnInit() {
  }

  loginBtnCredentials() {
    if (this.selectedDepartment === 0) {
      this.login();
    } else if (this.selectedDepartment === 1) {
      this.doctorLogin();
    }
  }

  login() {
    this.loginService.login(this.loginReq).subscribe({
      next: (res) => {
        localStorage.setItem('authToken', res.token);
        this.loadUserDetails();
      },
      error: (error) => {
        console.error('Login error', error);
      }
    });
  }

  loadUserDetails() {
    this.headersService.getUserDetails().subscribe({
      next: (res) => {
        this.sharedService.userDetails = res.user;
        this.sharedService.userDepartment = res.department;
        localStorage.setItem('id', res.user.id);
        localStorage.setItem('type',"0");
        this.socketService.connect(res.user.id);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error fetching user details', error);
        localStorage.removeItem('authToken');
      }
    });
  }

  doctorLogin() {
    this.loginService.doctorLogin(this.loginReq).subscribe({
      next: (res) => {
        localStorage.setItem('authToken', res.token);
        this.loadDoctorDetails();
      },
      error: (error) => {
        console.error('Doctor login error', error);
      }
    });
  }

  loadDoctorDetails() {
    this.headersService.getDoctorDetails().subscribe({
      next: (res) => {
        this.sharedService.userDetails = res.doctor;
        // this.sharedService.userDepartment = res.department;
        localStorage.setItem('id', res.doctor.id);
        localStorage.setItem('type',"1");
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error fetching doctor details', error);
        localStorage.removeItem('authToken');
      }
    });
  }
}
