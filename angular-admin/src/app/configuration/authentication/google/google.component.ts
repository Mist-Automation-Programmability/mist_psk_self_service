import { Component, OnInit, Input } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { MatChipInputEvent } from '@angular/material/chips';


import { AuthConfigService } from "../../../services/auth.service";

@Component({
  selector: 'app-configuration-google',
  templateUrl: './google.component.html',
  styleUrls: ['./../../configuration.component.css']
})
export class GoogleComponent implements OnInit {
  // used to validate mat-chips
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  
  // data from parent
  @Input() auth: {
    domains: []
  }
  @Input() host: string

  constructor(private _auth_config_service: AuthConfigService) { }
  
  // local vars
  google = {
    domains: []
  }
  error_message = ""

  ////////////////////////
  // INIT
  ////////////////////////
  ngOnInit(): void {
    // be sure the settings are zeroised
    this.google.domains = []   
    // retrieve configuration from the server
    this._auth_config_service.auth$.subscribe(config => {
      if (config) {
        if (config.hasOwnProperty("domains")) this.google.domains = config["domains"];
      }
    })
  }

  ////////////////////////
  // ADD NEW DOMAIN - check validity and if not already present
  ////////////////////////
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if (this.google.domains.indexOf(value.trim()) < 0) {
        if (value.indexOf(".") > -1 && value.indexOf(".") < value.length - 1 && value.indexOf("@") < 0) {
          this.google.domains.push(value.trim());
          this.error_message = ""
        } else this.error_message = value.trim() + " is not a valid domain name"
      }
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  ////////////////////////
  // DELETE DOMAIN
  ////////////////////////
  remove(domain: String): void {
    const index = this.google.domains.indexOf(domain);
    if (index >= 0) {
      this.google.domains.splice(index, 1);
    }
  }

}
