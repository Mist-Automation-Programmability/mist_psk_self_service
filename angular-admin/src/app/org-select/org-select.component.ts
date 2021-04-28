import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

export interface Org {
  id: string;
  name: string;
  //role: string;
}

@Component({
  selector: 'app-org-select',
  templateUrl: './org-select.component.html',
  styleUrls: ['./org-select.component.css']
})
export class OrgSelectComponent implements OnInit {

  constructor(private _formBuilder: FormBuilder, private _http: HttpClient, private _router: Router) { }

  org_id: string = "";
  orgs: Org[] = [];
  loading: boolean = false;
  error_mess: string = "";

  ngOnInit(): void {
    this.loadOrgs()
  }



  //// LOAD ORGS ////
  loadOrgs(): void {
    this.orgs = []
    this.loading = true;
    this._http.get<any>('/api/admin/orgs').subscribe({
      next: data => {
        this.orgs = data;
        this.loading = false;
      },
      error: error => this.error_message(error.error)
    })
  }

  submitOrg(): void {
    this._http.post<any>('/api/admin/orgs', {org_id: this.org_id}).subscribe({
      next: data => {
        this._router.navigate(['/admin/config']);
      },
      error: error => this.error_message(error.error)
    })
  }

  // WHEN AUTHENTICATION IS NOT OK
  error_message(message): void {
    this.loading = false;
    this.error_mess = message;
  }

}


