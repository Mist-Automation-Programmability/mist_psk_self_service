import { Component, OnInit } from '@angular/core';
import { LogoutService } from '../services/logout.service';
import { LanguageService } from '../services/i18n.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  constructor(private _language_service: LanguageService, private _logout_service: LogoutService) { }

  ngOnInit() {
    this._logout_service.setUrl("");
    this._language_service.setLanguage("");
  }
}
