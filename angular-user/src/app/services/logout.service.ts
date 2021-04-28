import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
    providedIn: 'root'
  })
export class LogoutService {

    // Observable string sources
    private logoutSource = new Subject<string>();

    // Observable string streams
    logout_url$ = this.logoutSource.asObservable();

    constructor() { }

    // Service message commands
    setUrl(logout_url: string) {
        this.logoutSource.next(logout_url);
    }

    
}