import { Component, OnInit, Input } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { MatChipInputEvent } from '@angular/material/chips';

import { AuthConfigService } from "../../../services/auth.service";
@Component({
  selector: 'app-configuration-azure',
  templateUrl: './azure.component.html',
  styleUrls: ['./../../configuration.component.css']
})
export class AzureComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];


  @Input() host: string
  @Input() org_id: string

  constructor(private _auth_config_service: AuthConfigService) { }


  azure = {
    client_id: "",
    client_secret: "",
    tenant: "",
    resource: "",
    allow_external_users: false,
    allow_unlicensed_filter: false,
    user_groups: []
  }
  callback: string;
  signin: string;

  ngOnInit(): void {
    this.azure = {
      client_id: "",
      client_secret: "",
      tenant: "",
      resource: "",
      allow_external_users: false,
      allow_unlicensed_filter: false,
      user_groups: []
    }
    this.callback = "https://" + this.host + "/azure/callback"
    this.signin = "https://" + this.host + "/azure/" + this.org_id + "/login"

    this._auth_config_service.auth$.subscribe(config => {
      if (config) {
        if (config.hasOwnProperty("client_id")) this.azure.client_id = config["client_id"]
        if (config.hasOwnProperty("client_secret")) this.azure.client_secret = config["client_secret"]
        if (config.hasOwnProperty("tenant")) this.azure.tenant = config["tenant"];
        if (config.hasOwnProperty("resource")) this.azure.resource = config["resource"];
        if (config.hasOwnProperty("allow_external_users")) this.azure.allow_external_users = config["allow_external_users"];
        if (config.hasOwnProperty("allow_unlicensed_filter")) this.azure.allow_unlicensed_filter = config["allow_unlicensed_filter"];
        if (config.hasOwnProperty("user_groups")) this.azure.user_groups = config["user_groups"];
      }
    })
  }



  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if (this.azure.user_groups.indexOf(value.trim()) < 0) {
        this.azure.user_groups.push(value.trim());
      }
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(user_group: String): void {
    const index = this.azure.user_groups.indexOf(user_group);

    if (index >= 0) {
      this.azure.user_groups.splice(index, 1);
    }
  }

  isValid() {
    if (!this.azure.client_id || this.azure.client_id == "") return false;
    else if (!this.azure.client_secret || this.azure.client_secret == "") return false;
    else if (!this.azure.tenant || this.azure.tenant == "") return false;
    else if (!this.azure.resource || this.azure.resource == "") return false;
    else return true;
  };

}
