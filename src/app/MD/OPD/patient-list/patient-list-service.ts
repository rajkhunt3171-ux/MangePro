import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PatientListService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPatientList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/medicaldepartment/opd/get-patient-list`);
  }

  deletePatient(patientId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/medicaldepartment/opd/delete-patient/${encodeURIComponent(patientId)}`);
  }

  changePatientStatus(data: { patientId: string; status: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/medicaldepartment/opd/change-patient-status`, data);
  }

  admitPatient(data: { patientId: string | number; idAdmitted: boolean; admissionDate?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/coredepart/ipd/admit-patient`, data);
  }

  requestToAppointment(data: { patientId: string | number; dateandtime: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/medicaldepartment/opd/request-to-appointment`, data);
  }

  setPaymentStatus(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/medicaldepartment/set-payment-status`, data);
  }
}
