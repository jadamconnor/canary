import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthenticateService } from '../authenticate.service';

@Component({
    selector: "auth-dialog",
    templateUrl: "./auth-dialog.component.html"
})
export class AuthDialogComponent {
    private email: string;
    private password: string;

    constructor(
        public afAuth: AngularFireAuth,
        public dialogRef: MatDialogRef<AuthDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data,
        public router: Router,
        public authService: AuthenticateService){
        this.email = data.email;
        this.password = data.password;
    }

    createAccount() {
        this.authService.createAccount(this.email, this.password)
        .subscribe(createNew => {
            if (createNew == true) {
                this.dialogRef.close();
                this.router.navigate(['journal']);                
            } else {
                alert('Something went horribly wrong. Try that again.')                
            }
        })
    }

    closeDialog() {
        this.dialogRef.close();
    }
}