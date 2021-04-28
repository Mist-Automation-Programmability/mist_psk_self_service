import { Component, OnInit, Input } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-configuration-azure',
  templateUrl: './azure.component.html',
  styleUrls: ['./../../configuration.component.css']
})
export class AzureComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  @Input() auth: {
    client_id: string,
    client_secret: string,
    tenant: string,
    resource: string,
    allow_external_users: boolean,
    allow_unlicensed_filter: boolean,
    user_groups: string[]
  }
  @Input() host: string
  @Input() org_id: string

  constructor() { }


    azure= {
      client_id: "",
      client_secret: "",
      tenant: "",
      resource: "",
      allow_external_users: false,
      allow_unlicensed_filter: false,
      user_groups: []
    }
    callback:string;
    signin:string;

  ngOnInit(): void {
    if (this.auth && this.auth.client_id) {
      this.azure.client_id = this.auth.client_id;
      this.azure.client_secret = this.auth.client_secret;
      this.azure.tenant = this.auth.tenant;
      this.azure.resource = this.auth.resource;
      this.azure.allow_external_users = this.auth.allow_external_users;
      this.azure.allow_unlicensed_filter = this.auth.allow_unlicensed_filter;
      this.azure.user_groups = this.auth.user_groups;
    }
    else this.azure= {
      client_id: "",
      client_secret: "",
      tenant: "",
      resource: "",
      allow_external_users: false,
      allow_unlicensed_filter: false,
      user_groups: []
    }
    this.callback="https://"+this.host+"/azure/callback"
    this.signin="https://"+this.host+"/azure/"+this.org_id+"/login"  }



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
