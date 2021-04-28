import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component'
import { PortalComponent } from './portal/portal.component'

const routes: Routes = [
  { path: 'login/:org_id', component: LoginComponent },
  { path: 'portal/:org_id', component: PortalComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // redirect to `first-component`
  { path: '**', redirectTo: '/login' }, // redirect to `first-component`
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'corrected' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
