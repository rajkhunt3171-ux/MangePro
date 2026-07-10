import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentService } from './payment.service';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';

import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-modal.html',
  styleUrls: ['./payment-modal.scss']
})
export class PaymentModalComponent implements OnInit {
  @Input() order: any;

  stripe: Stripe | null = null;
  stripeElements: StripeElements | null = null;
  showStripeForm: boolean = false;

  paymentGateways = [
    { id: 'razorpay', name: 'Razorpay', img: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Razorpay_Logo.png' },
    { id: 'stripe', name: 'Stripe', img: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' },
    { id: 'paypal', name: 'PayPal', img: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
    { id: 'phonepe', name: 'PhonePe', img: 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg' },
    { id: 'paytm', name: 'Paytm', img: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg' },
    { id: 'googlepay', name: 'Google Pay', img: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg' },
    { id: 'amazonpay', name: 'Amazon Pay', img: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Amazon_Pay_logo.svg' },
    { id: 'cashfree', name: 'Cashfree', img: 'https://images.crunchbase.com/image/upload/c_lpad,f_auto,q_auto:eco,dpr_1/ub9kksatxt7hvwzuxnle' },
    { id: 'ccavenue', name: 'CCAvenue', img: 'https://1000logos.net/wp-content/uploads/2023/10/CCAvenue-Logo-1024x576.png' },
    { id: 'instamojo', name: 'Instamojo', img: 'https://www.instamojo.com/blog/wp-content/uploads/2016/11/logo.png' },
    { id: 'cash', name: 'Cash', img: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' }
  ];

  constructor(
    public activeModal: NgbActiveModal,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    this.stripe = await loadStripe(environment.stripePublishableKey);
  }

  processPayment(gatewayId: string) {
    if (!this.order) return;
    if (gatewayId === 'stripe') {
      this.doStripePayment();
    } else if (gatewayId === 'razorpay') {
      this.doRazorpayPayment();
    } else if (gatewayId === 'paypal') {
      this.doPaypalPayment();
    } else if (gatewayId === 'phonepe') {
      this.doPhonepePayment();
    } else if (gatewayId === 'paytm') {
      this.doPaytmPayment();
    } else if (gatewayId === 'googlepay') {
      this.doGooglePayPayment();
    } else if (gatewayId === 'amazonpay') {
      this.doAmazonPayPayment();
    } else if (gatewayId === 'cashfree') {
      this.doCashfreePayment();
    } else if (gatewayId === 'ccavenue') {
      this.doCCAvenuePayment();
    } else if (gatewayId === 'instamojo') {
      this.doInstamojoPayment();
    } else if (gatewayId === 'cash') {
      this.doCashPayment();
    }
  }

  async doStripePayment() {
    if (!this.stripe) {
      alert('Stripe not loaded');
      return;
    }

    this.paymentService.createStripePaymentIntent(this.order.amount).subscribe({
      next: async (res: any) => {
        console.log(res);
        this.showStripeForm = true;
        this.cdr.detectChanges(); // Force view update immediately

        this.stripeElements = this.stripe!.elements({
          clientSecret: res.clientSecret
        });

        const paymentElement = this.stripeElements.create('payment');
        paymentElement.mount('#payment-stripe-element');
      },

      error: (err) => {
        console.log(err);
        alert("Payment Failed");
      }
    });
  }

  async confirmPayment() {

    if (!this.stripe || !this.stripeElements) return;

    const result = await this.stripe.confirmPayment({
      elements: this.stripeElements,
      confirmParams: {
        return_url: 'http://localhost:4200/payment-success'
      },
      redirect: 'if_required'
    });

    if (result.error) {
      alert(result.error.message);
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      alert('Payment successful!');
      console.log(result);
      this.activeModal.close('success');
      
      // Navigate to the success page using Angular Router (SPA approach)
      this.router.navigate(['/payment-success'], {
        queryParams: {
          payment_intent: result.paymentIntent.id,
          redirect_status: result.paymentIntent.status
        }
      });
    }

  }

  doRazorpayPayment() {

  }

  doPaypalPayment() {

  }

  doPhonepePayment() {

  }

  doPaytmPayment() {

  }

  doGooglePayPayment() {

  }

  doAmazonPayPayment() {

  }

  doCashfreePayment() {

  }

  doCCAvenuePayment() {

  }

  doInstamojoPayment() {

  }

  doCashPayment() {

  }
}
