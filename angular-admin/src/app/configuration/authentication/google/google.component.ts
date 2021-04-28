import { Component, OnInit, Input } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { MatChipInputEvent } from '@angular/material/chips';



@Component({
  selector: 'app-configuration-google',
  templateUrl: './google.component.html',
  styleUrls: ['./../../configuration.component.css']
})
export class GoogleComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  
  @Input() auth: {
    domains: []
  }
  @Input() host: string

  constructor() { }

  google = {
    domains: []
  }
  error_message = ""
  ngOnInit(): void {
    if (this.auth.domains) this.google.domains = this.auth.domains;
    else this.google.domains = []
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if (this.google.domains.indexOf(value.trim()) < 0) {
        if (value.indexOf(".") > -1 && value.indexOf(".") < value.length - 1 && value.indexOf("@") < 0) {
          this.google.domains.push(value.trim());
          this.error_message = ""
        } else this.error_message = value.trim() + " is not a valid domain name"
      }
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(domain: String): void {
    const index = this.google.domains.indexOf(domain);

    if (index >= 0) {
      this.google.domains.splice(index, 1);
    }
  }

}
