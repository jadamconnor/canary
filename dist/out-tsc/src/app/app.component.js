import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { NavigationEnd } from '@angular/router';
let AppComponent = class AppComponent {
    constructor(router, elementRef) {
        this.router = router;
        this.elementRef = elementRef;
        this.title = 'canary';
    }
    ngAfterViewInit() {
        this.router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                if (e.url == '/authenticate') {
                    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#bcc9d8';
                }
                else if (e.url == '/journal') {
                    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#bcc9d8';
                }
            }
        });
    }
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.css']
    })
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map