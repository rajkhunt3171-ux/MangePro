import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/order';

  constructor(private http: HttpClient) { }

  getOrders(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-order`);
  }

  createOrder(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/generate-order`);
  }

  deleteOrder(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/delete-order/${id}`);
  }
}
