import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../service/shared-service';
import { Headers } from './headers';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  user: any;

  constructor(
    public sharedService: SharedService,
    private headersService: Headers
  ) { }

  ngOnInit() {
    this.userDetails();
  }

  userDetails() {
    this.headersService.getUserDetails().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (error) => {
        console.error('Error fetching user details', error);
      }
    });
  }

  logout() {
    this.headersService.logout();
  }
}
