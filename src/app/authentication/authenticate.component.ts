import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthenticateService } from './authenticate.service';
import { AuthDialogComponent } from './authdialog/auth-dialog.component';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { take } from 'rxjs/operators';

@Component({
	selector: 'app-authenticate',
	templateUrl: './authenticate.component.html',
	styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent {

	public email: string;
	public password: string;

	constructor(public afAuth: AngularFireAuth, public authService: AuthenticateService, public router: Router, private dialog: MatDialog) {}

	newAccountDialog(status: string) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.data = {
				status: status,
				email: this.email,
				password: this.password
			}
		let dialogRef = this.dialog.open(AuthDialogComponent, dialogConfig);
	}

	authenticate() {
		this.authService.authenticate(this.email, this.password)
		.pipe(take(1))
		.subscribe(status => {
			if (status === 'success') {
				console.log('You are now authenticated.');
				this.router.navigate(['journal']);
			} else {
				this.newAccountDialog(status);
				console.log('Authentication status: ', status);
			}
		})
	}

}
