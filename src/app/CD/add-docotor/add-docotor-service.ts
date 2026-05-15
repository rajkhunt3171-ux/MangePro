import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AddDocotorService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createDoctor(data: any) {
    return this.http.post<any>(`${this.baseUrl}/coredepart/dm/add-dm`, data);
  }
}
