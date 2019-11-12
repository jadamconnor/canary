import { Injectable, Inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class AuthenticateService {

	public user: Observable<firebase.User>;
	public isAuth: boolean = false;
	public redirectUrl: string;

	constructor(
		public afAuth: AngularFireAuth,
		public router: Router) {
		this.user = afAuth.authState;
	}

	authenticate(email: string, password: string): Observable<string> {
		let status = new Subject<string>();

		this.afAuth.auth.signInWithEmailAndPassword(email, password)
		.then(() => {
			status.next('success');
			this.isAuth = true;
		})
		.catch(error => {
			if (error.code == 'auth/user-not-found') {
				status.next('new');
			} else if (error.code == 'auth/wrong-password') {
				status.next('invalid')
			} else {
				status.next(error)
			}
		})

		return status;
	}

	createAccount(email: string, password: string): Observable<boolean> {
		let success = new Subject<boolean>();
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
		})
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
}
