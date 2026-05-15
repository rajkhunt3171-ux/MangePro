import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Headers {

  constructor(private http: HttpClient, private router: Router) { }

  getUserDetails(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/auth/user-info`);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('id');
    this.router.navigate(['/login']);
  }
}
