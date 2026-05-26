import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class CreatePatientService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDoctors(): Observable<any> {
    return this.http.get(`${this.baseUrl}/coredepart/dm/get-dm`);
  }

  createPatient(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/medicaldepartment/opd/add-patient`, data);
  }
}
