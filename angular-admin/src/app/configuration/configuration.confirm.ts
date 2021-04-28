import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'configuration.confirm',
    templateUrl: 'configuration.confirm.html',
})
export class ConfirmDialog {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialog>, @Inject(MAT_DIALOG_DATA) public data) { }


    cancelConfirm(): void {
        this.dialogRef.close(false);
    }
    confirm(): void {
        this.dialogRef.close(true)
    }
}