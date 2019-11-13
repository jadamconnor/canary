import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import * as firebase from 'firebase';
import 'firebase/firestore';
;
let JournalService = class JournalService {
    constructor(db, afAuth, authService) {
        this.db = db;
        this.afAuth = afAuth;
        this.authService = authService;
        this.submitStatus = new Subject();
        this.entryCount = new Subject();
        this.user = authService.user;
        this.user.subscribe(user => {
            this.userDom = this.db.doc(`users/${user.uid}`);
        });
    }
    getEntries() {
        return this.userDoc.collection('entries').valueChanges();
    }
    setEntryCount() {
        let i = 0;
        this.getEntries()
            .subscribe(entries => {
            for (let e of entries) {
                this.entryCount.next(i += 1);
            }
        });
    }
    getDaysEvents() {
        let daysEvents = new Subject();
        this.getEntries()
            .subscribe(entries => {
            entries.forEach(entry => {
                if (this.isToday(entry.date)) {
                    daysEvents.next(entry.events);
                }
            });
        });
        return daysEvents;
    }
    getDaysConditions() {
        let daysConditions = new Subject();
        this.getEntries()
            .subscribe(entries => {
            entries.forEach(entry => {
                if (this.isToday(entry.date)) {
                    daysConditions.next(entry.conditions);
                }
            });
        });
        return daysConditions;
    }
    setEntry(uid, entry) {
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
    updateEntry(uid, entry, e) {
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
        }
        else {
            if (entry.conditions.length > 0 && entry.events.length === 0) {
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
            }
            else if (entry.conditions.length === 0 && entry.events.length > 0) {
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
    updateUserTables(uid, entry) {
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
        }
        else {
            if (entry.conditions.length > 0 && entry.events.length === 0) {
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
            }
            else if (entry.conditions.length === 0 && entry.events.length > 0) {
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
    setUserTables(uid, entry) {
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
    submitJournal(entry) {
        let newDay = true;
        this.user.subscribe(user => {
            this.userDoc.valueChanges().subscribe(data => {
                if (data) {
                    this.updateUserTables(user.uid, entry);
                }
                else {
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
                }
                else {
                    this.setEntry(user.uid, entry);
                }
            })
                .catch(err => {
                console.log('There was an error while getting the document: ', err);
            });
        });
    }
    isToday(td) {
        const today = new Date();
        const date = new Date(td);
        return today.toDateString() == date.toDateString();
    }
    lastJournaled() {
        let lastJournaled = new Subject();
        this.getEntries()
            .subscribe(data => {
            lastJournaled.next(data[data.length - 1].date);
        });
        return lastJournaled;
    }
    journaledToday() {
        let journaled = new Subject();
        this.userDoc.collection('entries').valueChanges()
            .subscribe(data => {
            if (data[0] != undefined) {
                if (this.isToday((data[data.length - 1].date))) {
                    journaled.next('true');
                }
                else {
                    journaled.next('false');
                }
            }
            else {
                journaled.next('new');
            }
        });
        return journaled;
    }
    phi(event, condition) {
        let i = 1;
        let table = [0, 0, 0, 0];
        let co = new Subject();
        this.user.subscribe(user => {
            this.userDoc = this.db.doc(`users/${user.uid}`);
            this.getEntries()
                .subscribe(entries => {
                for (let entry of entries) {
                    if (!entry.conditions.includes(condition) && !entry.events.includes(event)) {
                        table[0] += 1;
                    }
                    else if (!entry.conditions.includes(condition) && entry.events.includes(event)) {
                        table[1] += 1;
                    }
                    else if (entry.conditions.includes(condition) && !entry.events.includes(event)) {
                        table[2] += 1;
                    }
                    else if (entry.conditions.includes(condition) && entry.events.includes(event)) {
                        table[3] += 1;
                    }
                }
                ;
                let coefficient = (table[3] * table[0] - table[2] * table[1]) /
                    Math.sqrt((table[2] + table[3]) *
                        (table[0] + table[1]) *
                        (table[1] + table[3]) *
                        (table[0] + table[2]));
                co.next(coefficient);
                // Don't forget to reset the table or the function will continue to increment its elements
                table = [0, 0, 0, 0];
            });
        });
        return co;
    }
    formJournalData() {
        let jData = {};
        let journalData = new Subject();
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
    getConditionData(condition) {
        let cData = new Subject();
        this.formJournalData().subscribe(data => {
            cData.next(data[condition]);
        });
        return cData;
    }
    getMyEvents() {
        let myEvents = new Subject();
        this.user.subscribe(user => {
            this.db.doc(`users/${user.uid}`).valueChanges()
                .subscribe(data => {
                data ? myEvents.next(data.myEvents) : myEvents.next([]);
            });
        });
        return myEvents;
    }
    getMyConditions() {
        let myConditions = new Subject();
        this.user.subscribe(user => {
            this.db.doc(`users/${user.uid}`).valueChanges()
                .subscribe(data => {
                data ? myConditions.next(data.myConditions) : myConditions.next([]);
            });
        });
        return myConditions;
    }
    editDaysEvents(event) {
        this.user.subscribe(user => {
            this.getEntries()
                .pipe(take(1))
                .subscribe(entries => {
                entries.forEach(entry => {
                    if (this.isToday(entry.date)) {
                        let e = entry.events;
                        e = e.filter(e => e !== event);
                        this.db.collection(`users`).doc(`${user.uid}/entries/${entry.date}`).update({
                            events: e
                        })
                            .then(() => {
                            return;
                        });
                    }
                });
            });
        });
    }
    editDaysConditions(condition) {
        this.user.subscribe(user => {
            this.getEntries()
                .pipe(take(1))
                .subscribe(entries => {
                entries.forEach(entry => {
                    if (this.isToday(entry.date)) {
                        let c = entry.conditions;
                        c = c.filter(c => c !== condition);
                        this.db.collection(`users`).doc(`${user.uid}/entries/${entry.date}`).update({
                            conditions: c
                        })
                            .then(() => {
                            return;
                        });
                    }
                });
            });
        });
    }
};
JournalService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], JournalService);
export { JournalService };
//# sourceMappingURL=journal.service.js.map