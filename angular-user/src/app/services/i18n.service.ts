import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
    providedIn: 'root'
  })
export class LanguageService {

    // Observable string sources
    private languageSource = new Subject<string>();

    // Observable string streams
    current_language$ = this.languageSource.asObservable();

    constructor() { }

    // Service message commands
    setLanguage(language: string) {
        this.languageSource.next(language);
    }

    
}