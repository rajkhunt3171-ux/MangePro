import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DoctorCalendarService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createLeave(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/coredepart/dm/add-leave`, data);
  }

  deleteLeave(data): Observable<any> {
    return this.http.post(`${this.baseUrl}/coredepart/dm/delete-leave`, data);
  }
}
