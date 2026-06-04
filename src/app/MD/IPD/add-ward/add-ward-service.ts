import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AddWardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createWard(data: { name: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/wards/create-ward`, data);
  }

  getWardList(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/wards/get-ward-list`);
  }

  deleteWard(wardId: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/wards/delete-ward/${encodeURIComponent(String(wardId))}`);
  }
}
