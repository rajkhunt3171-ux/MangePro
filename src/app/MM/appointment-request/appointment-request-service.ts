import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentRequestService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAppointmentRequestList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/medicaldepartment/request-to-appointment-list`);
  }

  getAppointmentRequestPatient(id: any) {
    return this.http.get(`${this.baseUrl}/medicaldepartment/get-patient-details-for-appointment/${id}`);
  }
}