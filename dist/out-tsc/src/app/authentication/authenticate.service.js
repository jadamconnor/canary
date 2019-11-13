import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
let AuthenticateService = class AuthenticateService {
    constructor(afAuth, router) {
        this.afAuth = afAuth;
        this.router = router;
        this.isAuth = false;
        this.user = afAuth.authState;
    }
    authenticate(email, password) {
        let status = new Subject();
        this.afAuth.auth.signInWithEmailAndPassword(email, password)
            .then(() => {
            status.next('success');
            this.isAuth = true;
        })
            .catch(error => {
            if (error.code == 'auth/user-not-found') {
                status.next('new');
            }
            else if (error.code == 'auth/wrong-password') {
                status.next('invalid');
            }
            else {
                status.next(error);
            }
        });
        return status;
    }
    createAccount(email, password) {
        let success = new Subject();
        this.afAuth.auth.createUserWithEmailAndPassword(email, password)
            .then(() => {
            console.log('Account creation successful.');
            success.next(true);
            this.isAuth = true;
        })
            .catch(error => {
            var errorMessage = error.message;
            console.log(errorMessage);
            success.next(false);
        });
        return success;
    }
    signOut() {
        this.afAuth.auth.signOut().then(() => {
            console.log('You have been signed out.');
            this.router.navigate(['/authenticate']);
        }).catch(error => {
            console.log(`Error signing out: ${error}`);
        });
    }
};
AuthenticateService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], AuthenticateService);
export { AuthenticateService };
//# sourceMappingURL=authenticate.service.js.map