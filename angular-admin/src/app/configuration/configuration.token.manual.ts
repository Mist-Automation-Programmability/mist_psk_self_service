import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'token.manual',
    templateUrl: 'configuration.token.manual.html',
})
export class ApitokenManualDialog {
    public apitoken: string;
    constructor(public dialogRef: MatDialogRef<ApitokenManualDialog>) { }

    closeToken() {
        this.dialogRef.close(this.apitoken);
    }
    cancelManualToken(): void {
        this.dialogRef.close();
    }
}