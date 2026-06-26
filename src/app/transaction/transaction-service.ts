import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private baseUrl = environment.apiUrl;
  private transactionListEndpoints = [
    `${this.baseUrl}/medicaldepartment/get-transaction-list`,
    `${this.baseUrl}/transaction/get-transaction-list`,
    `${this.baseUrl}/managementmodule/get-transaction-list`,
    `${this.baseUrl}/get-transaction-list`,
  ];

  constructor(private http: HttpClient) { }

  getTransactionList() {
    return this.tryTransactionEndpoint(0);
  }

  private tryTransactionEndpoint(index: number): Observable<any> {
    const endpoint = this.transactionListEndpoints[index];

    if (!endpoint) {
      return throwError(() => new Error('Transaction list API not configured.'));
    }

    return this.http.get<any>(endpoint).pipe(
      catchError((error) => {
        if (error?.status !== 404 || index === this.transactionListEndpoints.length - 1) {
          return throwError(() => error);
        }

        return this.tryTransactionEndpoint(index + 1);
      })
    );
  }
}
