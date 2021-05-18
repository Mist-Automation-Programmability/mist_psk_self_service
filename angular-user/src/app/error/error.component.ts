import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LogoutService } from '../services/logout.service';
import { LanguageService } from '../services/i18n.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  constructor(private _language_service: LanguageService, private _logout_service: LogoutService, private _http: HttpClient) { }

  error_text = "It seems we may have some issues..."

  ngOnInit() {
    this._logout_service.setUrl("");
    this._language_service.setLanguage("");
  }

  parse_data(data){
    if (data.error) this.error_text = data.error 
  }

  getErrorMessage(){
    this._http.get("/api/user/error").subscribe({
      next: data => this.parse_data(data),
      error: error => console.log(error)
    })
  }

}
