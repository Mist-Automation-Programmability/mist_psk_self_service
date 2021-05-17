import { Component, OnInit } from '@angular/core';
import { LogoutService } from '../services/logout.service';
import { LanguageService } from '../services/i18n.service';

@Component({
  selector: 'app-unknown',
  templateUrl: './unknown.component.html',
  styleUrls: ['./unknown.component.css']
})
export class UnknownComponent implements OnInit {

  constructor(private _language_service: LanguageService, private _logout_service: LogoutService) { }

  ngOnInit() {
    this._logout_service.setUrl("");
    this._language_service.setLanguage("");
  }
}
