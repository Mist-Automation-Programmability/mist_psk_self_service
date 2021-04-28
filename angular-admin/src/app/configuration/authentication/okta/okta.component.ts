import { Component, OnInit, Input } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';




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

  constructor() { }

  okta = {
    audience: "",
    client_id: "",
    client_secret: ""
  }
  login_redirect_url:string;
  initiate_login_url:string;
  error_message = ""
  ngOnInit(): void {
    if (this.auth && this.auth.audience) {
      this.okta.audience = this.auth.audience;
      this.okta.client_id = this.auth.client_id;
      this.okta.client_secret = this.auth.client_secret
    }
    else this.okta = {
      audience: "",
      client_id: "",
      client_secret: ""
    }
    this.login_redirect_url="https://"+this.host+"/okta/callback"
    this.initiate_login_url="https://"+this.host+"/okta/"+this.org_id+"/login"
  }

}
