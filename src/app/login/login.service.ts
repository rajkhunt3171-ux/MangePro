import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    login(data): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/auth/login`, data);
    }

    doctorLogin(data): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/auth/doctor-login`, data);
    }
}