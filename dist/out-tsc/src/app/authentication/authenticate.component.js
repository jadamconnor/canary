import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { AuthDialogComponent } from './authdialog/auth-dialog.component';
import { MatDialogConfig } from "@angular/material";
let AuthenticateComponent = class AuthenticateComponent {
    constructor(afAuth, authService, router, dialog) {
        this.afAuth = afAuth;
        this.authService = authService;
        this.router = router;
        this.dialog = dialog;
    }
    newAccountDialog() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
            email: this.email,
            password: this.password
        };
        let dialogRef = this.dialog.open(AuthDialogComponent, dialogConfig);
    }
    authenticate() {
        this.authService.authenticate(this.email, this.password)
            .subscribe(status => {
            if (status === 'success') {
                console.log('You are now authenticated.');
                this.router.navigate(['journal']);
            }
            else if (status === 'new') {
                this.newAccountDialog();
            }
            else if (status === 'invalid') {
                alert('It looks like your credentials were wrong.');
            }
            else {
                alert(`Something went terribly wrong: ${status}`);
            }
        });
    }
    ngOnInit() {
    }
};
AuthenticateComponent = __decorate([
    Component({
        selector: 'app-authenticate',
        templateUrl: './authenticate.component.html',
        styleUrls: ['./authenticate.component.css']
    })
], AuthenticateComponent);
export { AuthenticateComponent };
//# sourceMappingURL=authenticate.component.js.map