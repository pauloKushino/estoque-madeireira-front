import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { LoginComponent } from './auth/login/login.component';
import { ProdutosComponent } from './produtos/produtos.component';
import { ClientesComponent } from './clientes/clientes.component';
import { VendasComponent } from './vendas/vendas.component';

export const routes: Routes = [
  // Login fica FORA do layout principal
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'produtos', pathMatch: 'full' },
      { path: 'produtos', component: ProdutosComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'vendas', component: VendasComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
