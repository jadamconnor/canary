import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthenticateService } from './authenticate.service';
import { AuthDialogComponent } from './authdialog/auth-dialog.component';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from "@angular/material";

@Component({
	selector: 'app-authenticate',
	templateUrl: './authenticate.component.html',
	styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent implements OnInit {

	private email: string;
	private password: string;
	
	constructor(
		public afAuth: AngularFireAuth,
		public authService: AuthenticateService,
		public router: Router,		
		private dialog: MatDialog) {}

	newAccountDialog() {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.data = {
			email: this.email,
			password: this.password
		}
		let dialogRef = this.dialog.open(AuthDialogComponent, dialogConfig);
	}

	authenticate() {
		this.authService.authenticate(this.email, this.password)
		.subscribe(status => {
			if (status === 'success') {				
				console.log('You are now authenticated.');
				this.router.navigate(['journal']);
			} else if (status === 'new') {
				this.newAccountDialog();				
			} else if (status === 'invalid') {
				alert('It looks like your credentials were wrong.');
			} else {
				alert(`Something went terribly wrong: ${status}`);
			}
		})
	}


	ngOnInit() {
	}

}
