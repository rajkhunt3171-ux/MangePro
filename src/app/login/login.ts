import { Component } from '@angular/core';
import { loginReq, loginRes } from './login.model';
import { SharedService } from '../shared/service/shared-service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  loginReq = new loginReq();
  loginRes = new loginRes();

  constructor(
    public sharedService: SharedService
  ) { }

  ngOnInit() {

  }
}
