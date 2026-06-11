import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ViewAppointmentPatientService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  addPatientVisitDetails(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/medicaldepartment/add-patient-visit-details`, data);
  }

  approveAppointmentRequest(appointmentId: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/medicaldepartment/approve-appointment-request/${encodeURIComponent(appointmentId)}`);
  }
}
