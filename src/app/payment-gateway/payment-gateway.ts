import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-payment-gateway',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './payment-gateway.html',
  styleUrls: ['./payment-gateway.scss']
})
export class PaymentGatewayComponent {
  
  constructor(private router: Router) {}

  generateOrder() {
    this.router.navigate(['/orderlist']);
  }
}
