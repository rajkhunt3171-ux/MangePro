import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AddRoomService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createRoom(data: { wardId: string | number; name: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/room/create-room`, data);
  }

  getRoomList(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/room/get-room-list`);
  }

  deleteRoom(roomId: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/room/delete-room/${encodeURIComponent(String(roomId))}`);
  }
}
