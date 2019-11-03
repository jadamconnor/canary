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
					this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#bcc9d8';
				} else if (e.url == '/journal') {
					this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#bcc9d8';
				}
			}
		})
	}
}
