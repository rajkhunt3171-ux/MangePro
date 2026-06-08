import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AddBedService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createBed(data: { wardId: string | number; roomId: string | number; name: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/bed/create-bed`, data);
  }

  getBedList(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/bed/get-bed-list`);
  }

  assignPatientToBed(data: { patientId: string | number; bedId: string | number; allocationStatus: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/bed/assign-patient-to-bed`, data);
  }

  deleteBed(bedId: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/bed/delete-bed/${encodeURIComponent(String(bedId))}`);
  }
}
