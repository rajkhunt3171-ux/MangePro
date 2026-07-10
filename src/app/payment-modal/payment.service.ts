import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/api/payment';

  constructor(private http: HttpClient) { }

  createStripePaymentIntent(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-stripe-payment-intent`,
      {
        amount: data
      });
  }
}
