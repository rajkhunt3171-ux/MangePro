import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from './shared/service/shared-service';
import { Headers } from './shared/component/header/headers';
import { SocketService } from './shared/service/socket-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(
    public sharedService: SharedService,
    public router: Router,
    private headersService: Headers,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    if (this.sharedService.isLoggedUser()) {
      if(localStorage.getItem('type') === "0"){
        this.loadUserDetails();
      } else if(localStorage.getItem('type') === "1"){
        this.loadDoctorDetails();
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadUserDetails() {
    this.headersService.getUserDetails().subscribe({
      next: (res) => {
        this.sharedService.userDetails = res.user;
        this.sharedService.userDepartment = res.department;
        localStorage.setItem('id', res.user.id);
        this.socketService.connect(res.user.id);

        if (this.router.url === '/login') {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error fetching user details', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('id');
        this.socketService.disconnect();
        this.router.navigate(['/login']);
      }
    });
  }

  loadDoctorDetails(){
    this.headersService.getDoctorDetails().subscribe({
      next: (res) => {
        this.sharedService.userDetails = res.doctor;
        // this.sharedService.userDepartment = res.department;
        localStorage.setItem('id', res.doctor.id);

        if (this.router.url === '/login') {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error fetching doctor details', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('id');
        this.socketService.disconnect();
        this.router.navigate(['/login']);
      }
    });
  }
}
