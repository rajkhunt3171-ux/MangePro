import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Login } from './login/login';

export const routes: Routes = [
    { path: 'login', component: Login },
    {
        path: '',
        component: Layout,
        loadChildren: () => import('./layout/layout.routes').then(m => m.layOutRoutes)
    },
    //   { path: 'forgot-password', component: ForgotPassword },

    { path: '**', redirectTo: '' }
];
