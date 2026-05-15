import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../service/shared-service';
import { Headers } from './headers';
import { SocketService } from '../../service/socket-service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  constructor(
    public sharedService: SharedService,
    private headersService: Headers,
    private router: Router,
    private socketService: SocketService
  ) { }

  ngOnInit() {
  }

  openProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.socketService.disconnect();
    this.sharedService.userDetails = null;
    this.sharedService.userDepartment = null;
    this.headersService.logout();
  }
}
