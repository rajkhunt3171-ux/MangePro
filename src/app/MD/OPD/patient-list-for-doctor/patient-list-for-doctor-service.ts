import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PatientListForDoctorService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPatientListForDoctor(): Observable<any> {
    return this.http.get(`${this.baseUrl}/medicaldepartment/opd/get-doctor-patient-list`);
  }
}
