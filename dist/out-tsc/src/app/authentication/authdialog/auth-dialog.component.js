import { __decorate, __param } from "tslib";
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
let AuthDialogComponent = class AuthDialogComponent {
    constructor(afAuth, dialogRef, data, router, authService) {
        this.afAuth = afAuth;
        this.dialogRef = dialogRef;
        this.router = router;
        this.authService = authService;
        this.email = data.email;
        this.password = data.password;
    }
    createAccount() {
        this.authService.createAccount(this.email, this.password)
            .subscribe(createNew => {
            if (createNew == true) {
                this.dialogRef.close();
                this.router.navigate(['journal']);
            }
            else {
                alert('Something went horribly wrong. Try that again.');
            }
        });
    }
    closeDialog() {
        this.dialogRef.close();
    }
};
AuthDialogComponent = __decorate([
    Component({
        selector: "auth-dialog",
        templateUrl: "./auth-dialog.component.html"
    }),
    __param(2, Inject(MAT_DIALOG_DATA))
], AuthDialogComponent);
export { AuthDialogComponent };
//# sourceMappingURL=auth-dialog.component.js.map