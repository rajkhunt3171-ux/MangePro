import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Login } from './login/login';
import { PaymentGatewayComponent } from './payment-gateway/payment-gateway';
import { OrderListComponent } from './order-list/order-list';
import { PaymentSuccessComponent } from './payment-success/payment-success';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'payment-gateway', component: PaymentGatewayComponent },
    { path: 'orderlist', component: OrderListComponent },
    { path: 'payment-success', component: PaymentSuccessComponent },
    {
        path: '',
        component: Layout,
        loadChildren: () => import('./layout/layout.routes').then(m => m.layOutRoutes)
    },
    //   { path: 'forgot-password', component: ForgotPassword },

    { path: '**', redirectTo: '' }
];
