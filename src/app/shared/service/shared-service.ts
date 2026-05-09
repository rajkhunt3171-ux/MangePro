import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {

  authToken: string = '';
  userDetails: any;
  userDepartment: any;

  isLoggedUser() {
    this.authToken = localStorage.getItem('authToken');
    if (this.authToken) {
      return true;
    }
    return false;
  }
}
