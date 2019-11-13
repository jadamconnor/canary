import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthenticateComponent } from './authentication/authenticate.component';
import { JournalComponent } from './journal/journal.component';
import { AuthenticateGuard } from './authentication/authenticate.guard';
const routes = [
    { path: 'journal', canActivate: [AuthenticateGuard], component: JournalComponent },
    { path: 'authenticate', component: AuthenticateComponent },
    { path: '', redirectTo: '/journal', pathMatch: 'full' }
];
let AppRoutingModule = class AppRoutingModule {
};
AppRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forRoot(routes)],
        exports: [RouterModule]
    })
], AppRoutingModule);
export { AppRoutingModule };
//# sourceMappingURL=app-routing.module.js.map