import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-success.html',
  styleUrls: ['./payment-success.scss']
})
export class PaymentSuccessComponent implements OnInit {
  paymentIntentId: string | null = null;
  redirectStatus: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.paymentIntentId = params['payment_intent'];
      this.redirectStatus = params['redirect_status'];

      if (this.paymentIntentId) {
        console.log('Stripe Transaction (Payment Intent) ID:', this.paymentIntentId);
        console.log('Payment Status:', this.redirectStatus);
      }
    });
  }
}
