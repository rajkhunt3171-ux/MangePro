import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-modal.html',
  styleUrls: ['./payment-modal.scss']
})
export class PaymentModalComponent implements OnInit {
  @Input() order: any;

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

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  processPayment(gatewayId: string) {
    if (!this.order) return;
    alert(`Selected ${gatewayId} for Order ID: ${this.order.order_id}\nAmount: ₹${this.order.amount}\n(Gateway integration will be implemented later)`);
    this.activeModal.close(gatewayId);
  }
}
