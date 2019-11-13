import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let AuthenticateGuard = class AuthenticateGuard {
    constructor(authService, router) {
        this.authService = authService;
        this.router = router;
    }
    canActivate(next, state) {
        let url = state.url;
        return this.checkAuth(url);
    }
    checkAuth(url) {
        if (this.authService.isAuth) {
            return true;
        }
        // Store the attempted URL for redirecting
        this.authService.redirectUrl = url;
        // Navigate to the login page with extras
        this.router.navigate(['/authenticate']);
        return false;
    }
};
AuthenticateGuard = __decorate([
    Injectable({
        providedIn: 'root'
    })
], AuthenticateGuard);
export { AuthenticateGuard };
//# sourceMappingURL=authenticate.guard.js.map