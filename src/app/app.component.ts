import { Component, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'canary';

	constructor(
		public router: Router,
		public elementRef: ElementRef) {}

	ngAfterViewInit(){
		this.router.events.subscribe(e => {
			if (e instanceof NavigationEnd) {
				if (e.url == '/authenticate') {
					this.elementRef.nativeElement.ownerDocument.body.style.background = 'linear-gradient(to right, #23a6d5, #673ab7)';
				} else if (e.url == '/journal') {
					this.elementRef.nativeElement.ownerDocument.body.style.background = 'linear-gradient(to right, #23a6d5, #673ab7)';
				}
			}
		})
	}
}
