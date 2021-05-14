import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorDialog } from "../../common/error"

@Component({
  selector: 'app-customization',
  templateUrl: './customization.component.html',
  styleUrls: ['./../configuration.component.css']
})
export class CustomizationComponent implements OnInit {

  constructor(private _router: Router, private _http: HttpClient, private _snackBar: MatSnackBar, private _dialog: MatDialog) { }

  is_working = false
  logo = {
    url: null
  };
  colors = {
    background: "#ececec",
    card: "#ffffff",
    primary: "#005c95",
    accent: "#84b135"
  }
  // default i18n values (en and fr)
  default_i18n = {}
  // i18n values retrieve from/to save on the server
  i18n = {}
  // dict of available loccals: {short: en, long: english}
  locales = {}
  // variables to keep track of edited locals
  previous_customized_locale = "en"
  current_customized_locale = "en"
  // i18n values manipulated on the UI
  default_locale = "en"
  custom_i18n = {
    login: {
      title: "",
      text: "",
      button: ""
    },
    portal: {
      title: "",
      text: "",
      create_button: "",
      email_button: "",
      qrcode_button: "",
      delete_button: "",
      logout_button: "",
      keyCreatedSuccesfully: "",
      keyDeletededSuccesfully: "",
      keySentSuccesfully: "",
      rows: []
    }
  }

  ngOnInit(): void {
    this.is_working = true
    this.loadMain()
    this.loadI18n()
  }

  parse_error(data): void {
    this.is_working = false
    if (data.status == "401") {
      this._router.navigate(["/"])
    } else {
      var message: string = "Unable to act the server... Please try again later... "
      if (data.error && data.error.message) message = data.error.message
      else if (data.error) message = data.error
      this.openSnackBar(message, "OK")
    }
  }

  addRow() {
    this.custom_i18n.portal.rows.push({ index: this.custom_i18n.portal.rows.length, icon: "", text: "" });
  }
  removeRow(index) {
    this.custom_i18n.portal.rows.splice(index, 1);
    for (var i = 0; i < this.custom_i18n.portal.rows.length; i++) {
      this.custom_i18n.portal.rows[i].index = i;
    }
  }


  loadMain() {
    this._http.get<any>('/api/admin/custom/').subscribe({
      next: data => {
        if (data.customization) {
          if (data.customization.logo) this.logo = data.customization.logo
          if (data.customization.colors) this.colors = data.customization.colors
          else this.default_locale = "en"
        }
        this.is_working = false
      },
      error: error => this.parse_error(error)
    })
  }

  //////////////////////////////////////////////////////////////////////////////
  /////           LOGO
  //////////////////////////////////////////////////////////////////////////////
  saveLogo(): void {
    this._http.post("/api/admin/custom", { logo: this.logo }).subscribe({
      next: data => this.openSnackBar("Logo saved!", "Ok"),
      error: error => this.parse_error(error)
    })
  }
  resetLogo(): void {
    this.logo.url = null
  }
  //////////////////////////////////////////////////////////////////////////////
  /////           COLORS
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  /////           DEFAULT LOCALE
  //////////////////////////////////////////////////////////////////////////////

  resetDefaultI18n() {
    this.default_i18n = "en"
  }

  saveDefaultI18n() {
    this._http.post("/api/admin/custom", { i18n_default: this.default_locale }).subscribe({
      next: data => this.openSnackBar("Default Language Saved!", "Ok"),
      error: error => this.parse_error(error)
    })
  }
  //////////////////////////////////////////////////////////////////////////////
  /////           LOCALES
  //////////////////////////////////////////////////////////////////////////////
  parse_i18n(data): void {

    if (data.i18n_default) this.default_locale = data.i18n_default
    else this.default_locale = data.default_i18n.i18n_default
    if (data.i18n && Object.keys(data.i18n).length > 0) this.i18n = data.i18n
    else this.i18n["en"] = data.default_i18n.en
    this.locales = data.default_i18n.languages
    this.current_customized_locale = this.default_locale
    this.custom_i18n = this.i18n[this.current_customized_locale]
  }

  loadI18n(): void {
    this._http.get("/api/admin/custom/i18n").subscribe({
      next: data => this.parse_i18n(data),
      error: error => this.parse_error(error)
    })
  }
  saveI18n(): void {
    this.changeCustomLocal(null)
    this._http.post("/api/admin/custom", { i18n: this.i18n }).subscribe({
      next: data => this.openSnackBar("Logo saved!", "Ok"),
      error: error => this.parse_error(error)
    })
  }
  resetI18n(): void {
    this.i18n = this.default_i18n;
  }
  setDefaultLanguage(event): void {
    this.i18n["default"] = event.value
  }

  displayCustomLocal(keep_previous_icons = false): void {
    var rows = this.custom_i18n.portal.rows
    // retrieve and display the values for newly selected locale
    if (this.i18n[this.current_customized_locale]) {
      this.custom_i18n = this.i18n[this.current_customized_locale]
    } else {
      this.custom_i18n = {
        login: {
          title: "",
          text: "",
          button: ""
        },
        portal: {
          title: "",
          text: "",
          create_button: "",
          email_button: "",
          qrcode_button: "",
          delete_button: "",
          logout_button: "",
          keyCreatedSuccesfully: "",
          keyDeletededSuccesfully: "",
          keySentSuccesfully: "",
          rows: []
        }
      }
    }
    if (keep_previous_icons) {
      //set the same icons as the previously selected locale
      for (var i = 0; i < rows.length; i++) {
        if (this.custom_i18n.portal.rows[i]) {
          rows[i].text = this.custom_i18n.portal.rows[i].text
        } else {
          rows[i].text = ""
        }
      }
      this.custom_i18n.portal.rows = rows
    }
    // save the current locale selection
    this.previous_customized_locale = this.current_customized_locale
  }


  validateCustomLocal(cb) {
    var error = 0
    if (this.custom_i18n.login.title == "") error += 1
    if (this.custom_i18n.login.text == "") error += 1
    if (this.custom_i18n.login.button == "") error += 1
    if (this.custom_i18n.portal.title == "") error += 1
    if (this.custom_i18n.portal.text == "") error += 1
    if (this.custom_i18n.portal.create_button == "") error += 1
    if (this.custom_i18n.portal.email_button == "") error += 1
    if (this.custom_i18n.portal.qrcode_button == "") error += 1
    if (this.custom_i18n.portal.delete_button == "") error += 1
    if (this.custom_i18n.portal.logout_button == "") error += 1
    if (this.custom_i18n.portal.keyCreatedSuccesfully == "") error += 1
    if (this.custom_i18n.portal.keyDeletededSuccesfully == "") error += 1
    if (this.custom_i18n.portal.keySentSuccesfully == "") error += 1
    console.log(error)
    console.log(this.custom_i18n)
    if (error > 0 && error < 13) {
      this.openError("Warning!", "Some fields are not configured. If you continue, the locale " + this.current_customized_locale + " won't be saved. Do you want to continue?", (result) => {
        cb(false, result)
      })
    } if (error == 13 && this.i18n.hasOwnProperty(this.current_customized_locale)) {
      delete this.i18n[this.current_customized_locale]
      cb(false, true)
    } else cb(true)
  }

  changeCustomLocal(event): void {
    console.log(this.i18n)
    console.log(this.previous_customized_locale)
    console.log(this.current_customized_locale)
    var error = null
    // save the customization into the locale selected before the change event
    this.validateCustomLocal((valid, discard) => {
      console.log(valid)
      if (valid) {
        // save customized locale
        this.i18n[this.previous_customized_locale] = this.custom_i18n
        this.previous_customized_locale = this.current_customized_locale
        this.displayCustomLocal()
      } else if (discard) {
        // if the user confirm, confirm the change and display the values without saving the customization
        this.previous_customized_locale = this.current_customized_locale
        this.displayCustomLocal()
      } else {
        // if the user doesn't confirm, reset the selected local with the previous one
        this.current_customized_locale = this.previous_customized_locale
      }
    })
  }




  //////////////////////////////////////////////////////////////////////////////
  /////           DIALOG BOXES
  //////////////////////////////////////////////////////////////////////////////


  // SNACK BAR
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: "center",
      verticalPosition: "top",
    });
  }
  // DIALOG BOXES
  // ERROR
  openError(title: string, test: string, cb): void {
    const dialogRef = this._dialog.open(ErrorDialog, {
      data: { title: title, text: test }
    });
    dialogRef.afterClosed().subscribe(result => cb(result))
  }
  reqDone() {
    this.openSnackBar("Configuration Saved.", "Ok")
    // $mdDialog.show({
    //   roller: LocalModal,
    //   templateUrl: '/web-app/modals/modalAdminDoneent.html',
    //   locals: {
    //     items: "modal.save.authentication"
    //   }
    // });
  }
}
