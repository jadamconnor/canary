import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormControl } from '@angular/forms';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import { Entry } from '../entry';
import { AuthenticateService } from '../authentication/authenticate.service';
import { JournalService } from './journal.service';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { faBook } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.css']
})
export class JournalComponent implements OnInit {

  private entry: Entry;
  private submissionStatus: Observable<boolean>;
  private lastJournaled: Observable<Date>;
  private journaledToday: Observable<string>;
  private faPencilAlt = faBook;
  private visible = true;
  private selectable = true;
  private removable = true;
  private addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  private formEvents: string[] = [];
  private formConditions: string[] = [];
  private myEvents: Observable<string[]>;
  private myConditions: Observable<string[]>;
  private myDoc: Observable<any>;
  private panelOpenState = false;
  private journalData: Observable<any>;

  constructor(
    private authService: AuthenticateService,
    private journalService: JournalService) {
    this.journalService.getUserDoc();
  }

  addEventChip(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.formEvents.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
  }

  addConditionChip(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.formConditions.push(value.trim());
    }
    if (input) {
      input.value = '';
    }
  }

  removeEventChip(event: string): void {
    const index = this.formEvents.indexOf(event);
    if (index >= 0) {
      this.formEvents.splice(index, 1);
    }
  }

  removeConditionChip(event: string): void {
    const index = this.formConditions.indexOf(event);
    if (index >= 0) {
      this.formConditions.splice(index, 1);
    }
  }

  createEntry() {
    let date = Date.now();
    this.entry = {
      date: date,
      events: this.formEvents,
      conditions: this.formConditions
    };
    this.submissionStatus = this.journalService.createEntry(this.entry);
    this.submissionStatus.subscribe(status => {
      if (status === true) {
        this.formEvents = null;
        this.formConditions = null;
      }
    })
  }

  signOut() {
    this.authService.signOut();
  }

  ngOnInit() {
    this.myDoc = this.journalService.userFields;
    this.journaledToday = this.journalService.journaledToday();
    this.myConditions = this.journalService.getMyConditions();
    this.myEvents = this.journalService.getMyEvents();
    this.journalData = this.journalService.getJournalData();
    this.journalData.subscribe(data => console.log(data.dizzy))
  }

}
