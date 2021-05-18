import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { QrCodeDialog } from './qrcode/qrcode';
import { ErrorDialog } from '../common/error';

import { LanguageService } from "../services/i18n.service"
import { LogoutService } from "../services/logout.service"

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.css', '../app.component.css']
})
export class PortalComponent implements OnInit {

  constructor(private _router: Router, private _http: HttpClient, public _dialog: MatDialog, private _snackBar: MatSnackBar, private _activated_route: ActivatedRoute, private _language_service: LanguageService, private _logout_service: LogoutService) { }

  i18n = {
    title: "",
    text: "",
    rows: [],
    create_button: "",
    email_button: "",
    qrcode_button: "",
    delete_button: "",
    logout_button: "",
    keyCreatedSuccesfully: "",
    keyDeletededSuccesfully: "",
    keySentSuccesfully: ""
  }

  user = {
    name: "",
    email: ""
  }

  key = "";
  ssid = "";

  key_exists = false;
  org_id: string;

  is_working: boolean = true;
  is_ready: boolean = false;
  loaded = {
    text: false,
    info: false,
    psk: false
  }

  //////////////////////////////////////////////////////////////////////////////
  /////           INIT
  //////////////////////////////////////////////////////////////////////////////

  ngOnInit(): void {
    this._language_service.current_language$.subscribe(current_language => {
      this.getText(current_language);
    });
    this._activated_route.params.forEach(p => this.org_id = p["org_id"])
    this.retrieveInfo();
    this.getMyKey();
  }

  //////////////////////////////////////////////////////////////////////////////
  /////           READY STATE
  //////////////////////////////////////////////////////////////////////////////

  checkLoads(part: string, status: boolean) {
    this.loaded[part] = status
    var tmp = true
    for (const [key, value] of Object.entries(this.loaded)) {
      if (value == false) tmp = false
    }
    this.is_ready = tmp
    if (this.is_ready) this.is_working = false;
  }

  //////////////////////////////////////////////////////////////////////////////
  /////           FUNCTIONS
  //////////////////////////////////////////////////////////////////////////////

  parse_error(data): void {
    this.is_working = false
    if (data.status == 401) {
      window.location.href = "/login/" + this.org_id
    } else {
      var message: string = "Unable to contact the server... Please try again later... "
      if (data.error && data.error.message) message = data.error.message
      else if (data.error) message = data.error
      this.openError(message)
    }
  }


  retrieveInfo(): void {
    this._http.get<any>('/api/user/myInfo/' + this.org_id).subscribe({
      next: data => {
        this.user = data.user,
          this._logout_service.setUrl(data.logout_url)
        this.checkLoads("info", true)
      },
      error: error => this.parse_error(error)
    })
  }

  //////////////////////////////////////////////////////////////////////////////
  /////           TEXT MGMT
  //////////////////////////////////////////////////////////////////////////////
  parseText(data): void {
    this.i18n = data.i18n;

    this.i18n.title = this.i18n.title.replace("{username}", this.user.name).replace("{email}", this.user.email).replace("ssid", this.ssid)
    this.i18n.text = this.i18n.text.replace("{username}", this.user.name).replace("{email}", this.user.email).replace("ssid", this.ssid)
    this.i18n.create_button = this.i18n.create_button.replace("{username}", this.user.name).replace("{email}", this.user.email).replace("ssid", this.ssid)
    this.i18n.email_button = this.i18n.email_button.replace("{username}", this.user.name).replace("{email}", this.user.email).replace("ssid", this.ssid)
    this.i18n.qrcode_button = this.i18n.qrcode_button.replace("{username}", this.user.name).replace("{email}", this.user.email).replace("ssid", this.ssid)
    this.i18n.delete_button = this.i18n.delete_button.replace("{username}", this.user.name).replace("{email}", this.user.email).replace("ssid", this.ssid)
    this.i18n.logout_button = this.i18n.logout_button.replace("{username}", this.user.name).replace("{email}", this.user.email).replace("ssid", this.ssid)
    this.i18n.keyCreatedSuccesfully = this.i18n.keyCreatedSuccesfully.replace("{username}", this.user.name).replace("{email}", this.user.email).replace("ssid", this.ssid)
    this.i18n.keyDeletededSuccesfully = this.i18n.keyDeletededSuccesfully.replace("{username}", this.user.name).replace("{email}", this.user.email).replace("ssid", this.ssid)
    this.i18n.keySentSuccesfully = this.i18n.keySentSuccesfully.replace("{username}", this.user.name).replace("{email}", this.user.email).replace("ssid", this.ssid)
    this.checkLoads("text", true)
  }

  getText(language: string): void {
    this._http.get("/api/user/text/" + this.org_id + "?page=portal&lang=" + language).subscribe({
      next: data => this.parseText(data),
      error: error => this.parse_error(error)
    })
  }
  //////////////////////////////////////////////////////////////////////////////
  /////           KEY MGMT
  //////////////////////////////////////////////////////////////////////////////

  getMyKey(): void {
    this._http.get<any>('/api/user/psk/' + this.org_id).subscribe({
      next: data => {
        if (data && data.passphrase && data.ssid) {
          this.key = data.passphrase;
          this.ssid = data.ssid;
          this.key_exists = true;
          this.checkLoads("psk", true)
        }
      },
      error: error => {
        this.parse_error(error)
        this.checkLoads("psk", true)
      }
    })
  }
  createMyKey(): void {
    this.is_working = true
    this._http.post<any>('/api/user/psk/', {}).subscribe({
      next: data => {
        this.key = data.passphrase;
        this.ssid = data.ssid;
        this.key_exists = true;
        this.is_working = false;
        this.openSnackBar(this.i18n.keyCreatedSuccesfully, "Ok");
      },
      error: error => {
        this.parse_error(error)
        this.is_working = false;
      }
    })
  }
  revokeMyKey(): void {
    this.is_working = true
    this._http.delete<any>('/api/user/psk/', {}).subscribe({
      next: data => {
        this.key = "";
        this.ssid = "";
        this.key_exists = false;
        this.is_working = false;
        this.openSnackBar(this.i18n.keyDeletededSuccesfully, "Ok")
      },
      error: error => {
        this.parse_error(error)
        this.is_working = false;
      }
    })
  }
  deliverByEmail(): void {
    this.is_working = true
    this._http.post<any>('/api/user/email', { ssid: this.ssid, psk: this.key }).subscribe({
      next: data => {
        this.is_working = false;
        this.openSnackBar(this.i18n.keySentSuccesfully.replace("{email}", this.user.email), "Ok")
      },
      error: error => {
        this.parse_error(error)
        this.is_working = false;
      }
    })
  }
  //////////////////////////////////////////////////////////////////////////////
  /////           DIALOG BOXES
  //////////////////////////////////////////////////////////////////////////////
  // ERROR
  openError(message: string): void {
    const dialogRef = this._dialog.open(ErrorDialog, {
      data: message
    });
  }

  // QRCODE DIALOG
  openQrcode(): void {
    const dialogRef = this._dialog.open(QrCodeDialog, {
      data: { ssid: this.ssid, passphrase: this.key }
    });
  }


  // SNACK BAR
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: "center",
      verticalPosition: "top",
    });
  }
}

