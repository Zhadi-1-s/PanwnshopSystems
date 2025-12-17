import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { ProfileComponent } from './common/pages/profile/profile.component';

export const routes: Routes = [
    {
        path: 'login', loadComponent: () => import('./common/pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
    },
    {
        path:'dashboard',loadComponent: () => import('./common/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent)
    },
    {
        path: '', redirectTo: 'dashboard', pathMatch: 'full'
    },
    {
        path:'register', loadComponent: () => import('./common/pages/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path:'reset-password',loadComponent : () => import('./common/pages/create-password/create-password.component').then(m => m.CreatePasswordComponent)
    },
    {
        path:'lombard-profile',loadComponent : () => import('./common/pages/lombard-profile/lombard-profile.component').then(m => m.LombardProfileComponent)
    },
    {
        path:'pawnshop-detail/:id',loadComponent: () => import('./common/pages/pawnshop-detail/pawnshop-detail.component').then(m => m.PawnshopDetailComponent)
    },
    {
        path:'pawnshop-list',loadComponent: () => import('./common/pages/pawnshop-list/pawnshop-list.component').then(m => m.PawnshopListComponent)
    },
    {
        path:'product-list',loadComponent: () => import('./common/pages/products-list/products-list.component').then(m => m.ProductsListComponent)
    }
    
];
