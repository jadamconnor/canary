import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import { Entry } from '../entry';
import { AuthenticateService } from '../authentication/authenticate.service';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase';
import 'firebase/firestore';

export interface UserDoc { myEntries:Entry[], myEvents: string[], myConditions: string[]};

@Injectable({
	providedIn: 'root'
})
export class JournalService {

	private user: Observable<firebase.User>;
	private userDoc: AngularFirestoreDocument<UserDoc>;
	public userFields: Observable<UserDoc>;
	public userEntries: Observable<Entry[]>;

	constructor(
		private db: AngularFirestore,
		private afAuth: AngularFireAuth,
		private authService: AuthenticateService) {
		this.user = authService.user;
		this.user.subscribe(user => {
			this.userDoc = this.db.doc<UserDoc>(`users/${user.uid}`);
			this.userFields = this.userDoc.valueChanges();
		})
	}

	createEntry(entry: Entry): Observable<boolean> {
		let status = new Subject<boolean>();
		let date = Date.now();
		this.user.subscribe(user => {
			const myDoc = this.db.doc(`users/${user.uid}`);
			let docSub = myDoc.valueChanges().subscribe(data => {
				if (data) {
					this.db.doc(`users/${user.uid}`).update({
						myEvents: firebase.firestore.FieldValue.arrayUnion(...entry.events)
					})
					.then(() => {
						console.log('Successful update() of myEvents')
						this.db.doc(`users/${user.uid}`).update({
							myConditions: firebase.firestore.FieldValue.arrayUnion(...entry.conditions)
						})
						.then(() => {
							console.log('Successful update() of myConditions')
							docSub.unsubscribe();
						})
						.catch(err => {
							console.log("Something went wrong during update() of myConditions: ", err)
						});
					})
					.catch(err => {
						console.log("Something went wrong during update() of myEvents: ", err)
					});
				} else {
					this.db.doc(`users/${user.uid}`).set({myEvents: entry.events})
					.then(() => {
						console.log('Successful set() of myEvents')
					})
					.catch(err => {
						console.log("Something went wrong during update() of myEvents: ", err)
					});
					this.db.doc(`users/${user.uid}`).set({myConditions: entry.conditions})
					.then(() => {
						console.log('Successful set() of myConditions')
					})
					.catch(err => {
						console.log("Something went wrong during update() of myConditions: ", err)
					});
				}
			});
			this.db.collection(`users`).doc(`${user.uid}/entries/${date}`).set(entry)
			.then(docRef => {
				status.next(true);
				console.log('Document added.');
			})
			.catch(error => {
				status.next(false);
				alert(`Error adding document: ${error}`);
			});
		});
		return status;
	}

	isToday(td) {
		const today = new Date();
		const date = new Date(td);
		return today.toDateString() == date.toDateString();
	}

	lastJournaled(): Observable<Date> {
		let lastJournaled = new Subject<Date>();
		this.userDoc.collection('entries').valueChanges()
		.subscribe(data => {
			lastJournaled.next(data[data.length - 1].date);
		});
		return lastJournaled;
	}

	journaledToday(): Observable<string> {
		let journaled = new Subject<string>();
		this.userDoc.collection('entries').valueChanges()
		.subscribe(data => {
			if (data[0] != undefined) {
				if (this.isToday((data[data.length - 1].date))) {
					journaled.next('false');
				} else {
					journaled.next('false');
				}
			} else {
				journaled.next('new')
			}
		})
		return journaled;
	}

	getUserDoc() {
		this.user.subscribe(user => {
			this.userDoc = this.db.doc<UserDoc>(`users/${user.uid}`);
			this.userFields = this.userDoc.valueChanges();
		})
	}

	getPhiCo(event: string, condition: string): Observable<number> {
		let phiArr = [0, 0, 0, 0];
		let cor = new Subject<number>();
		this.user.subscribe(user => {
			this.userDoc = this.db.doc<UserDoc>(`users/${user.uid}`);
			this.userDoc.collection<Entry>('entries').valueChanges()
			.subscribe(entries => {
				for (let entry of entries) {
					if (!entry.conditions.includes(condition) && !entry.events.includes(event)) {
						phiArr[0] += 1;
					} else if (!entry.conditions.includes(condition) && entry.events.includes(event)) {
						phiArr[1] += 1;
					} else if (entry.conditions.includes(condition) && !entry.events.includes(event)) {
						phiArr[2] += 1;
					} else if (entry.conditions.includes(condition) && entry.events.includes(event)) {
						phiArr[3] += 1;
					}
				}
				cor.next(this.phi(phiArr));
			})
		})
		return cor;
	}

	phi(table: number[]): number {
		return (table[3] * table[0] - table[2] * table[1]) /
		Math.sqrt(
			(table[2] + table[3]) * 
			(table[0] + table[1]) * 
			(table[1] + table[3]) * 
			(table[0] + table[2]));
	}

	getJournalData(): Observable<any> {
		let jData = {};
		let journalData = new Subject<any>();
		this.getMyConditions().subscribe(conditions => {
      conditions.forEach(condition => {
        jData[condition] = {};
        this.getMyEvents().subscribe(events => {
          events.forEach(event => {
            this.getPhiCo(event, condition).subscribe(data => {
              jData[condition][event] = data;
            });
          });
        });
      });
    journalData.next(jData);
    });
    return journalData;
	}

	getMyEvents(): Observable<string[]> {
		let myEvents = new Subject<string[]>();
		this.user.subscribe(user => {
			this.userDoc = this.db.doc<UserDoc>(`users/${user.uid}`);
			this.userDoc.valueChanges().subscribe(data => {
				myEvents.next(data.myEvents);
			})
		})
		return myEvents;
	}

	getMyConditions(): Observable<string[]> {
		let myConditions = new Subject<string[]>();
		this.user.subscribe(user => {
			this.userDoc = this.db.doc<UserDoc>(`users/${user.uid}`);
			this.userDoc.valueChanges().subscribe(data => {
				myConditions.next(data.myConditions);
			})
		})
		return myConditions;
	}

}
