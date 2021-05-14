import { Component } from '@angular/core';


@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent {


  constructor() { }


  ngOnInit(): void {}



  // parse_error(data): void {
  //   if (data.status == "401") {
  //     this._router.navigate(["/"])
  //   } else {
  //     var message: string = "Unable to contact the server... Please try again later... "
  //     if (data.error && data.error.message) message = data.error.message
  //     else if (data.error) message = data.error
  //     this.openSnackBar(message, "OK")
  //   }
  // }


  // //////////////////////////////////////////////////////////////////////////////
  // /////           CUSTOMIZATION
  // //////////////////////////////////////////////////////////////////////////////
  // save() {
    
  //   var data = {
  //     logo: this.customComp.logo,
  //     colors: this.customComp.colors,
  //     login: this.customComp.login.enable,
  //     app: this.customComp.app
  //   }
  //   console.log(data)
  //   // this._http.post<any>('/api/admin/custom/', data).subscribe({
  //   //   next: data => {
  //   //     this.is_working = false
  //   //     this.reqDone()
  //   //   },
  //   //   error: error => {
  //   //     this.is_working = false
  //   //     var message: string = "Unable to contact the server... Please try again later... "
  //   //     if ("error" in error) { message += error["error"]["message"] }
  //   //     this.openError(message)
  //   //   }
  //   // })
  // }



}