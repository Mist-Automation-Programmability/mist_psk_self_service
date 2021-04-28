import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileReader } from 'filereader';

import { ErrorDialog } from './../common/error'
@Component({
  selector: 'app-customization',
  templateUrl: './customization.component.html',
  styleUrls: ['./customization.component.css']
})
export class CustomizationComponent implements OnInit {

  constructor(private _router: Router, private _http: HttpClient, public _dialog: MatDialog, public _fileReader: FileReader, private _snackBar: MatSnackBar) { }

  isWorking = false
  status = {
    logo: "disabled",
    colors: "disabled",
    login: "disabled",
    app: "disabled"
  };
  logo = {
    enable: false,
    header: null,
    login: null
  };
  colors = {
    enable: false,
    color: "#000000",
    contrastDefaultColor: "light"
  }
  login = {
    enable: false,
    title: "",
    text: "",
  }
  app = {
    enable: false,
    title: "",
    rows: [{ index: 0, icon: "", text: "" }]
  }
  textColor = "black"
  logoFile
  // color picker options
  colorPicker = {
    openOnInput: true,
    alphaChannel: false,
    rgb: false,
    hsl: false
  };

  ngOnInit(): void {
    this.isWorking = true
    this._http.get<any>('/api/admin/custom/').subscribe({
      next: data => {
        if (data.logo) this.logo = data.logo
        if (data.colors) this.colors = data.colors
        if (this.colors.color.indexOf("#") < 0) { this.colors.color = "#" + this.colors.color }
        if (data.login) this.login = data.login
        if (data.app) this.app = data.app
        if (this.app.rows.length == 0) this.app.rows = [{ index: 0, icon: "", text: "" }]
        this.isWorking = false
      },
      error: error => {
        this.isWorking = false
        var message: string = "Unable to contact the server... Please try again later... "
        if ("error" in error) { message += error["error"]["message"] }
        this.openError(message)
      }
    })
  }

  changeLogo() {
    if (this.logo.enable) this.status.logo = "enabled";
    else this.status.logo = "disabled";
  }
  changeColor() {
    if (this.colors.enable) this.status.colors = "enabled";
    else this.status.colors = "disabled";
  }
  changeLogin() {
    if (this.login.enable) this.status.login = "enabled";
    else this.status.login = "disabled";
  }
  changeApp() {
    if (this.app.enable) this.status.app = "enabled";
    else this.status.app = "disabled";
  }
  changeContrastDefaultColor() {
    if (this.colors.contrastDefaultColor == "light") this.textColor = "white";
    else this.textColor = "black";
  }

  getLogoHeader() {
    this._fileReader.readAsDataUrl(this.logoFile, this)
      .then(function (result) {
        if (result) {
          this.logo.header = result;
        }
      });
  };
  getLogoLogin() {
    this._fileReader.readAsDataUrl(this.logoFile, this)
      .then(function (result) {
        if (result) {
          this.logo.login = result;
        }
      });
  };

  addRow() {
    this.app.rows.push({ index: this.app.rows.length, icon: "", text: "" });
  }
  removeRow(index) {
    this.app.rows.splice(index, 1);
    for (var i = 0; i < this.app.rows.length; i++) {
      this.app.rows[i].index = i;
    }
  }

  isValid() {

    if (this.logo && this.logo.enable && (!this.logo.header || !this.logo.login)) return false;
    // else if (this.login && this.login.enable && !this.loginForm.$valid) return false;
    // else if (this.app && this.app.enable && !this.appForm.$valid) return false;
    else return true;
  }

  save() {
    this.isWorking = true
    var data = {
      logo: this.logo,
      colors: this.colors,
      login: this.login.enable,
      app: this.app
    }
    this._http.post<any>('/api/admin/custom/', data).subscribe({
      next: data => {
        this.isWorking = false
        this.reqDone()
      },
      error: error => {
        this.isWorking = false
        var message: string = "Unable to contact the server... Please try again later... "
        if ("error" in error) { message += error["error"]["message"] }
        this.openError(message)
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

  // SNACK BAR
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: "center",
      verticalPosition: "top",
    });
  }

  reqDone() {
    this.openSnackBar("Configuration Saved.", "Ok")
    // $mdDialog.show({
    //   controller: LocalModal,
    //   templateUrl: '/web-app/modals/modalAdminDoneContent.html',
    //   locals: {
    //     items: "modal.save.authentication"
    //   }
    // });
  }
}
