import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from './shared/service/shared-service';
import { Headers } from './shared/component/header/headers';

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
    private headersService: Headers
  ) { }

  ngOnInit() {
    if (this.sharedService.isLoggedUser()) {
      this.loadUserDetails();
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
        if (this.router.url === '/login') {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error fetching user details', error);
        localStorage.removeItem('authToken');
        this.router.navigate(['/login']);
      }
    });
  }
}
