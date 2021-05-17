import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
    providedIn: 'root'
  })
export class LogoutService {

    // Observable string sources
    private logoutSource = new Subject<string>();
    private show = new Subject<boolean>();

    // Observable string streams
    logout_url$ = this.logoutSource.asObservable();
    show_language$ = this.show.asObservable();

    constructor() { }

    // Service message commands
    setUrl(logout_url: string) {
        this.logoutSource.next(logout_url);
        this.show.next(logout_url != "")
    }

    
}