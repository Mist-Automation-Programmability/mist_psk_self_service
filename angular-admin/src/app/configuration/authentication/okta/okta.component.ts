import { Component, OnInit, Input } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { AuthConfigService } from "../../../services/auth.service";



@Component({
  selector: 'app-configuration-okta',
  templateUrl: './okta.component.html',
  styleUrls: ['./../../configuration.component.css']
})
export class OktaComponent implements OnInit {
  @Input() auth: {
    audience: string,
    client_id: string,
    client_secret: string
  }
  @Input() host: string
  @Input() org_id: string

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private _auth_config_service: AuthConfigService) { }

  okta = {
    audience: "",
    client_id: "",
    client_secret: ""
  }
  login_redirect_url: string;
  initiate_login_url: string;
  error_message = ""
  ngOnInit(): void {
    this.okta = {
      audience: "",
      client_id: "",
      client_secret: ""
    }
    this.login_redirect_url = "https://" + this.host + "/okta/callback"
    this.initiate_login_url = "https://" + this.host + "/okta/" + this.org_id + "/login"

    this._auth_config_service.auth$.subscribe(config => {
      if (config) {
        if (config.hasOwnProperty("audience")) this.okta.audience = config["audience"];
        if (config.hasOwnProperty("client_id")) this.okta.client_id = config["client_id"];
        if (config.hasOwnProperty("client_secret")) this.okta.client_secret = config["client_secret"];
      }
    });
  }
}
