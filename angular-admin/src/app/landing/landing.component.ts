import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';

export interface TwoFactorData {
  twoFactor: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./../login/login.component.css']
})


export class LandingComponent implements OnInit {

  constructor(private _http: HttpClient, private _router: Router, private _platformLocation: PlatformLocation
  ) { }

  github_url: string;
  docker_url: string;
  disclaimer: string;
  host: string = "";
  show_github_fork_me: boolean = false;

  //// INIT ////
  ngOnInit(): void {
    console.log('trest')
    this._http.get<any>("/api/admin/disclaimer").subscribe({
      next: data => {
        if (data.disclaimer) this.disclaimer = data.disclaimer;
        if (data.github_url) this.github_url = data.github_url;
        if (data.docker_url) this.docker_url = data.docker_url;
      }
    })
  }


  // WHEN AUTHENTICATION IS OK
  goToLogin(): void {
    console.log('trest')
    this._router.navigate(['/admin/login']);
  }

}