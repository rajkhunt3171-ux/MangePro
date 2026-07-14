import {
  Component,
  Input,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentService } from './payment.service';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

declare var paypal: any;

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

  showStripeForm = false;
  showPaypalForm = false;

  paymentGateways = [
    {
      id: 'stripe',
      name: 'Stripe',
      img: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      img: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg'
    }
  ];

  constructor(
    public activeModal: NgbActiveModal,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  async ngOnInit() {
    this.stripe = await loadStripe(environment.stripePublishableKey);
  }

  processPayment(id: string) {

    if (id === 'stripe') {
      this.doStripePayment();
    }

    if (id === 'paypal') {
      this.doPaypalPayment();
    }

  }

  //-----------------------------------------
  // STRIPE
  //-----------------------------------------

  async doStripePayment() {

    this.paymentService
      .createStripePaymentIntent(this.order.amount)
      .subscribe(async (res: any) => {

        this.showStripeForm = true;
        this.showPaypalForm = false;

        this.cdr.detectChanges();

        this.stripeElements = this.stripe!.elements({
          clientSecret: res.clientSecret
        });

        const paymentElement =
          this.stripeElements.create('payment');

        paymentElement.mount('#payment-stripe-element');

      });

  }

  async confirmPayment() {

    const result = await this.stripe!.confirmPayment({

      elements: this.stripeElements!,

      redirect: 'if_required'

    });

    if (result.paymentIntent?.status == 'succeeded') {

      alert("Stripe Payment Success");

      this.activeModal.close();

    }

  }

  //-----------------------------------------
  // PAYPAL
  //-----------------------------------------

  doPaypalPayment() {
    this.showPaypalForm = true;
    this.showStripeForm = false;
    this.cdr.detectChanges();

    setTimeout(() => {

      const div =
        document.getElementById("paypal-button-container");

      if (div) {
        div.innerHTML = "";
      }

      paypal.Buttons({

        style: {

          layout: 'vertical',

          color: 'blue',

          shape: 'rect',

          label: 'paypal'

        },

        createOrder: () => {

          return this.paymentService
            .createPaypalPaymentIntent(this.order.amount)
            .toPromise()
            .then((res: any) => {

              return res.orderID;

            });

        },

        onApprove: (data: any) => {

          return this.paymentService
            .createPaypalPaymentIntent(data.orderID)
            .toPromise()
            .then((payment: any) => {

              alert("Payment Success");

              console.log(payment);

              this.activeModal.close();

              this.router.navigate(['/payment-success']);

            });

        },

        onCancel: () => {

          alert("Payment Cancelled");

        },

        onError: (err: any) => {

          console.log(err);

          alert("Payment Failed");

        }

      }).render('#paypal-button-container');

    }, 100);

  }

}