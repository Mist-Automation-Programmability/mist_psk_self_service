import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
    providedIn: 'root'
  })
export class LanguageService {

    // Observable string sources
    private languageSource = new Subject<string>();
    private show = new Subject<boolean>();

    // Observable string streams
    current_language$ = this.languageSource.asObservable();
    show_language$ = this.show.asObservable();

    constructor() { }

    // Service message commands
    setLanguage(language: string) {
        this.languageSource.next(language);
        this.show.next(language != "")        
    }

    
}