import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { LanguageService } from "./services/i18n.service";
import { LogoutService } from "./services/logout.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  constructor(private _http: HttpClient, private _language_service: LanguageService, private _logout_service: LogoutService) { }

  current_language: string = "en";
  logout_url: string;
  logo_url: string;
  languages = []

  ngOnInit(): void {
    this._language_service.setLanguage("en")
    this._logout_service.logout_url$.subscribe(url => this.logout_url = url)
    this.getLanguages()
    this.getCustom()
  }

  changeLanguage(e) {
    if (e.source._selected) {
      console.log(e)
      this.current_language = e.source.value
      this._language_service.setLanguage(this.current_language)
    }
  }

  parse_language(data) {
    this.current_language = data.default;
    this._language_service.setLanguage(this.current_language)
    this.languages = data.languages;
  }
  parse_error(data): void {
    console.log(data)
  }

  getLanguages(): void {
    this._http.get("/api/user/languages").subscribe({
      next: data => this.parse_language(data),
      error: error => this.parse_error(error)
    })
  }
  parse_custom(data):void {
    this.logo_url = data.logo_url
  }
  getCustom(): void {
    this._http.get("/api/user/custom").subscribe({
      next: data => this.parse_custom(data),
      error: error => this.parse_error(error)
    })
  }

}
