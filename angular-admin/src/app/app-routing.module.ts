import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './landing/landing.component'
import { LoginComponent } from './login/login.component'
import { ConfigurationComponent } from './configuration/configuration.component';
import { OrgSelectComponent } from './org-select/org-select.component';
//import { CustomizationComponent } from './customization/customization.component';
const routes: Routes = [
  { path: 'admin', component: LandingComponent },
  { path: 'admin/login', component: LoginComponent },
  { path: 'admin/orgs', component: OrgSelectComponent },
  {path: 'admin/config', component: ConfigurationComponent},
  //  { path: 'customization', component: CustomizationComponent },
  { path: '', redirectTo: '/admin', pathMatch: 'full' }, // redirect to `first-component`
  { path: '**', redirectTo: '/admin' }, // redirect to `first-component`
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'corrected' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
