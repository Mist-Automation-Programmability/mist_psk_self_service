import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component'
import { UnknownComponent } from './unknown/unknown.component'
import { PortalComponent } from './portal/portal.component'

const routes: Routes = [
  { path: 'login/:org_id', component: LoginComponent },
  { path: 'portal/:org_id', component: PortalComponent },
  { path: 'unknown', component: UnknownComponent },
  { path: '', redirectTo: '/unknown', pathMatch: 'full' }, // redirect to `first-component`
  { path: '**', redirectTo: '/unknown' }, // redirect to `first-component`
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'corrected' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
