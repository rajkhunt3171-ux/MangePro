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
  constructor(
    public sharedService: SharedService,
    private headersService: Headers
  ) { }

  ngOnInit() {
  }

  logout() {
    this.headersService.logout();
  }
}
