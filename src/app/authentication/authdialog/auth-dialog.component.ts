import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthenticateService } from '../authenticate.service';

@Component({
    selector: "auth-dialog",
    templateUrl: "./auth-dialog.component.html"
})
export class AuthDialogComponent {
    public email: string;
    public password: string;
    public status: string;

    constructor(
        public afAuth: AngularFireAuth,
        public dialogRef: MatDialogRef<AuthDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data,
        public router: Router,
        public authService: AuthenticateService){
        this.email = data.email;
        this.password = data.password;
        this.status = data.status;
    }

    createAccount() {
        this.authService.createAccount(this.email, this.password)
        .subscribe(createNew => {
            if (createNew == true) {
                this.status = 'unverified';
            } else {
                alert('Something went horribly wrong. Try that again.')
            }
        })
    }

    forgotCreds() {
      this.authService.forgotCreds(this.email)
      .subscribe(success => {
        success ? this.status = 'reset success' : this.status = 'reset failure';
      })
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
