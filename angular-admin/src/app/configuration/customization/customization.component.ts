import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorDialog } from "../../common/error"

@Component({
  selector: 'app-customization',
  templateUrl: './customization.component.html',
  styleUrls: ['./../configuration.component.css', "./customization.component.css"]
})
export class CustomizationComponent implements OnInit {

  constructor(private _router: Router, private _http: HttpClient, private _snackBar: MatSnackBar, private _dialog: MatDialog) { }
  leftColor
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
  saveColors(): void {
    this._http.post("/api/admin/custom", { colors: this.colors }).subscribe({
      next: data => this.openSnackBar("Colors saved!", "Ok"),
      error: error => this.parse_error(error)
    })
  }
  resetColors(): void {
    this.colors = {
      background: "#ececec",
      card: "#ffffff",
      primary: "#005c95",
      accent: "#84b135"
    }
  }
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
  addRow() {
    this.custom_i18n.portal.rows.push({ index: this.custom_i18n.portal.rows.length, icon: "", text: "" });
  }
  removeRow(index) {
    this.custom_i18n.portal.rows.splice(index, 1);
    for (var i = 0; i < this.custom_i18n.portal.rows.length; i++) {
      this.custom_i18n.portal.rows[i].index = i;
    }
  }

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
      next: data => this.openSnackBar("Languages saved!", "Ok"),
      error: error => this.parse_error(error)
    })
  }
  setDefaultLanguage(event): void {
    this.i18n["default"] = event.value
  }

  displayCustomLocal(): void {
    
    // retrieve and display the values for newly selected locale
    if (this.i18n[this.current_customized_locale]) {
      this.custom_i18n = this.i18n[this.current_customized_locale]
      // or display empty fields
    } else {
      //save the rows/icons from the previously selected locale
        var rows = []
        this.custom_i18n.portal.rows.forEach((row)=> {
          rows.push({icon: row.icon, text: ""})  
        })
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
          rows: rows
        }
      }
    }

    // save the current locale selection
    this.previous_customized_locale = this.current_customized_locale
  }


  validateCustomLocal(cb) {
    var error = 0
    var max_errors = 13
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
    this.custom_i18n.portal.rows.forEach((row) => {
      max_errors +=1
      if (row.text == "") {
        error += 1
      }
    })
    if (error > 0 && error < max_errors) {
      this.openError("Warning!", "Some fields are not configured. If you continue, the changes on the locale \"" + this.previous_customized_locale + "\" will be discarded. Do you want to continue?", (result) => {
        cb(false, result)
      })
    } else if (error == max_errors && this.i18n.hasOwnProperty(this.previous_customized_locale)) {
      delete this.i18n[this.previous_customized_locale]
      cb(false, true)
    } else cb(true)
  }

  changeCustomLocal(event): void {
    // check if all the fields are valid
    this.validateCustomLocal((valid:boolean, discard:boolean) => {
      if (valid) {
        // form is valid. Save customized locale and display the requested one
        this.i18n[this.previous_customized_locale] = this.custom_i18n
        this.displayCustomLocal()
      } else if (discard) {
        // form is not valid, but the user wants to discard the changes. Discard customized locale and display the requested one
        this.displayCustomLocal()
      } else {
        // form is not valid and user didn't want to discard the changes. Restore the previous locale as the current locale
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
