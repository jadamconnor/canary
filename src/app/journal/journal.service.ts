import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import { Entry } from '../entry';
import { AuthenticateService } from '../authentication/authenticate.service';
import { count, map, take, tap, filter } from 'rxjs/operators';
import * as firebase from 'firebase';
import 'firebase/firestore';

export interface UserDoc { myEntries:Entry[], entryCount: number, myEvents: string[], myConditions: string[]};

@Injectable({
	providedIn: 'root'
})
export class JournalService {

	private user: Observable<firebase.User>;
	private userDoc: AngularFirestoreDocument<UserDoc>;
	public userFields: Observable<UserDoc>;
	public userEntries: Observable<Entry[]>;
	public submitStatus = new Subject<boolean>();

	constructor(private db: AngularFirestore, authService: AuthenticateService) {
		this.user = authService.user;
		this.user.subscribe(user => {
			this.userDoc = this.db.doc<UserDoc>(`users/${user.uid}`);
		});
	}

	getEntries(): Observable<any> {
		return this.userDoc.collection('entries').valueChanges();
	}

	getEntryCount(): Observable<number> {
		return this.userDoc.valueChanges()
		.pipe(map(data => data.entryCount));
	}

	getDaysEntry(): Observable<Entry> {
		return this.getEntries()
		.pipe(map(entries => entries.filter(entry => this.isToday(entry.date))));
	}

	setEntry(uid: string, entry: Entry) {
		this.db.collection(`users`).doc(`${uid}/entries/${entry.date}`).set(entry)
		.then(docRef => {
			this.submitStatus.next(true);
			console.log('Document added.');
		})
		.catch(error => {
			this.submitStatus.next(false);
			alert(`Error adding document: ${error}`);
		});
	}

	updateEntry(uid: string, entry: Entry, e: Entry) {
		if (entry.conditions.length > 0 && entry.events.length > 0) {
			this.db.collection(`users`).doc(`${uid}/entries/${e.date}`).update({
				events: firebase.firestore.FieldValue.arrayUnion(...entry.events),
				conditions: firebase.firestore.FieldValue.arrayUnion(...entry.conditions)
			})
			.then(docRef => {
				this.submitStatus.next(true);
				console.log('Document updated.');
			})
			.catch(error => {
				this.submitStatus.next(false);
				alert(`Error adding document: ${error}`);
			});
		} else {
			if (entry.conditions.length > 0 && entry.events.length ===  0) {
				this.db.collection(`users`).doc(`${uid}/entries/${e.date}`).update({
					conditions: firebase.firestore.FieldValue.arrayUnion(...entry.conditions)
				})
				.then(docRef => {
					this.submitStatus.next(true);
					console.log('Document updated.');
				})
				.catch(error => {
					this.submitStatus.next(false);
					alert(`Error adding document: ${error}`);
				});
			} else if (entry.conditions.length === 0 && entry.events.length >  0) {
				this.db.collection(`users`).doc(`${uid}/entries/${e.date}`).update({
					events: firebase.firestore.FieldValue.arrayUnion(...entry.events)
				})
				.then(docRef => {
					this.submitStatus.next(true);
					console.log('Document updated.');
				})
				.catch(error => {
					this.submitStatus.next(false);
					alert(`Error adding document: ${error}`);
				});
			}
		}
	}

	updateUserTables(uid: string, entry: Entry) {
		if (entry.conditions.length > 0 && entry.events.length > 0) {
			this.db.doc(`users/${uid}`).update({
				myEvents: firebase.firestore.FieldValue.arrayUnion(...entry.events),
				myConditions: firebase.firestore.FieldValue.arrayUnion(...entry.conditions)
			})
			.then(() => {
				this.submitStatus.next(true);
				console.log('Successful update() of user tables');
			})
			.catch(err => {
				this.submitStatus.next(false);
				console.log("Something went wrong during update() of user tables: ", err);
			});
		} else {
			if (entry.conditions.length > 0 && entry.events.length ===  0) {
				this.db.doc(`users/${uid}`).update({
					myConditions: firebase.firestore.FieldValue.arrayUnion(...entry.conditions)
				})
				.then(() => {
					this.submitStatus.next(true);
					console.log('Successful update() of user tables');
				})
				.catch(err => {
					this.submitStatus.next(false);
					console.log("Something went wrong during update() of user tables: ", err);
				});
			} else if (entry.conditions.length === 0 && entry.events.length >  0) {
				this.db.doc(`users/${uid}`).update({
					myEvents: firebase.firestore.FieldValue.arrayUnion(...entry.events)
				})
				.then(() => {
					this.submitStatus.next(true);
					console.log('Successful update() of user tables');
				})
				.catch(err => {
					this.submitStatus.next(false);
					console.log("Something went wrong during update() of user tables: ", err);
				});
			}
		}
	}

	setUserTables(uid: string, entry: Entry) {
		this.db.doc(`users/${uid}`).set({
			myEvents: entry.events,
			myConditions: entry.conditions
		})
		.then(() => {
			this.submitStatus.next(true);
			console.log('Successful set() of user tables');
		})
		.catch(err => {
			this.submitStatus.next(false);
			console.log("Something went wrong during set() of user tables: ", err);
		});
	}

	submitJournal(entry: Entry) {
		let newDay = true;
		this.user.subscribe(user => {
			this.userDoc.valueChanges().subscribe(data => {
				if (data) {
					this.updateUserTables(user.uid, entry);
				} else {
					this.setUserTables(user.uid, entry);
				}
			});
			this.db.firestore.doc(`/users/${user.uid}`).get()
			.then(docSnapshot => {
				if (docSnapshot.exists) {
					this.getEntries()
					.pipe(take(1))
					.subscribe(entries => {
						for (let e of entries) {
							if (this.isToday(e.date)) {
								newDay = false;
								this.updateEntry(user.uid, entry, e);
							}
						}
						if (newDay === true) {
							this.setEntry(user.uid, entry);
						}
					});
				} else {
					this.setEntry(user.uid, entry);
				}
			})
			.catch(err => {
				console.log('There was an error while getting the document: ', err);
			})
		});
	}

	isToday(td) {
		const today = new Date();
		const date = new Date(td);
		return today.toDateString() == date.toDateString();
	}

	lastJournaled(): Observable<Date> {
		let lastJournaled = new Subject<Date>();
		this.getEntries()
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
					journaled.next('true');
				} else {
					journaled.next('false');
				}
			} else {
				journaled.next('new')
			}
		})
		return journaled;
	}

	phi(event: string, condition: string): Observable<number> {
		let i = 1;
		let table = [0, 0, 0, 0];
		let co = new Subject<number>();
		this.user.subscribe(user => {
			this.userDoc = this.db.doc<UserDoc>(`users/${user.uid}`);
			this.getEntries()
			.subscribe(entries => {
				for (let entry of entries) {
					if (!entry.conditions.includes(condition) && !entry.events.includes(event)) {
						table[0] += 1;
					} else if (!entry.conditions.includes(condition) && entry.events.includes(event)) {
						table[1] += 1;
					} else if (entry.conditions.includes(condition) && !entry.events.includes(event)) {
						table[2] += 1;
					} else if (entry.conditions.includes(condition) && entry.events.includes(event)) {
						table[3] += 1;
					}
				};
				let coefficient = (table[3] * table[0] - table[2] * table[1]) /
				Math.sqrt((table[2] + table[3]) * (table[0] + table[1]) * (table[1] + table[3]) * (table[0] + table[2]));
				co.next(coefficient);
				// Don't forget to reset the table or the function will continue to increment its elements
				table = [0, 0, 0, 0];
			});
		});
		return co;
	}

	formJournalData(): Observable<any> {
		let jData = {};
		let journalData = new Subject<any>();
		this.getMyConditions().subscribe(conditions => {
			conditions.forEach(condition => {
				jData[condition] = {};
				this.getMyEvents().subscribe(events => {
					events.forEach(event => {
						// We should try to only use event-condition combinations that actually occur.
						this.phi(event, condition).subscribe(data => {
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
			this.db.doc<UserDoc>(`users/${user.uid}`).valueChanges()
			.subscribe(data => {
				data ? myEvents.next(data.myEvents) : myEvents.next([]);
			})
		})
		return myEvents;
	}

	getMyConditions(): Observable<string[]> {
		let myConditions = new Subject<string[]>();
		this.user.subscribe(user => {
			this.db.doc<UserDoc>(`users/${user.uid}`).valueChanges()
			.subscribe(data => {
				console.log('getMyConditions')
				data ? myConditions.next(data.myConditions) : myConditions.next([]);
			})
		})
		return myConditions;
	}

	editDaysEvents(event: string) {
		this.user.subscribe(user => {
			this.getEntries()
			.pipe(take(1))
			.subscribe(entries => {
				entries.forEach(entry => {
					if (this.isToday(entry.date)) {
						let e = entry.events
						e = e.filter(e => e !== event);
						this.db.collection(`users`).doc(`${user.uid}/entries/${entry.date}`).update({
							events: e
						})
						.then(() => {
							return;
						})
					}
				});
			});
		});
	}

	editDaysConditions(condition: string) {
		this.user.subscribe(user => {
			this.getEntries()
			.pipe(take(1))
			.subscribe(entries => {
				entries.forEach(entry => {
					if (this.isToday(entry.date)) {
						let c = entry.conditions
						c = c.filter(c => c !== condition);
						this.db.collection(`users`).doc(`${user.uid}/entries/${entry.date}`).update({
							conditions: c
						})
						.then(() => {
							return;
						})
					}
				});
			});
		});
	}

}
