import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { OrderService } from './order.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentModalComponent } from '../payment-modal/payment-modal';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [RouterModule, CommonModule, HttpClientModule],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.scss']
})
export class OrderListComponent implements OnInit {
  orders = signal<any[]>([]);

  constructor(private orderService: OrderService, private modalService: NgbModal) { }

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.orderService.getOrders().subscribe({
      next: (res) => {
        const fetchedOrders = res.orders || [];
        fetchedOrders.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        this.orders.set(fetchedOrders);
      },
      error: (err) => {
        console.error('Error fetching orders', err);
      }
    });
  }

  addOrder() {
    this.orderService.createOrder().subscribe({
      next: (res) => {
        this.fetchOrders();
      },
      error: (err) => {
        console.error('Error generating order', err);
      }
    });
  }

  deleteOrder(id: string) {
    this.orderService.deleteOrder(id).subscribe({
      next: (res) => {
        this.fetchOrders();
      },
      error: (err) => {
        console.error('Error deleting order', err);
        alert('Failed to delete order');
      }
    });
  }

  payOrder(order: any) {
    const modalRef = this.modalService.open(PaymentModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.order = order;
    
    modalRef.result.then((result) => {
      if (result) {
        console.log(`Payment processed via ${result}`);
        // Optionally fetch orders again to reflect payment status update (when implemented)
      }
    }, (reason) => {
      console.log('Payment modal dismissed');
    });
  }
}
