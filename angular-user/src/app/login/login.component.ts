import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import {LanguageService} from '../services/i18n.service';
import {LogoutService} from '../services/logout.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @Input()  current_lanaguage:string;
  
  constructor(private _http: HttpClient, private _activated_route: ActivatedRoute, private _language_service: LanguageService, private _logout_service : LogoutService ) { }

  auth_url: string;
  i18n = {
    title: "",
    text: "",
    button: ""
  }

  error;
  org_id: string;

  ngOnInit(): void {
    this._logout_service.setUrl("");
    this._language_service.current_language$.subscribe(current_language => {
      this.getText(current_language);
    });
    this._activated_route.params.forEach( p => this.org_id  =p["org_id"])
    this.getAuthUrl();
  }


  parseAuthUrl(data): void {
    this.auth_url = data.url;

  }

  getAuthUrl(): void {
    this._http.get("/api/user/auth_url/"+this.org_id).subscribe({
      next: data => {
        this.parseAuthUrl(data)},
      error: error => this.error = error
    })
  }

  parseText(data): void {
    this.i18n = data.i18n;
  }

  getText(current_language:string): void {
    var query = "?page=login"
    if (current_language != 'init') query += "&lang="+current_language
    this._http.get("/api/user/text/"+this.org_id+query).subscribe({
      next: data => this.parseText(data),
      error: error => this.error = error
    })
  }

}
