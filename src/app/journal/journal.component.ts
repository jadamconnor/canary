import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormControl } from '@angular/forms';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subject, from } from 'rxjs';
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
  private faBook = faBook;
  private visible = true;
  private selectable = true;
  private removable = true;
  private addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  private formEvents: string[] = [];
  private formConditions: string[] = [];
  public renderedConditions: string[] = [];
  public renderedEvents: string[] = [];
  private myEvents: Observable<string[]>;
  private myConditions: Observable<string[]>;
  private myDoc: Observable<any>;
  private entryOpenState = false;
  private viewOpenState = false;
  private journalData: Observable<any>;
  private conditionData = new Subject<any>();
  condCtrl = new FormControl();
  filteredConditions: Observable<string[]>;
  eventCtrl = new FormControl();
  filteredEvents: Observable<string[]>;

  @ViewChild('eventInput', {static: false}) eventInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoEvent', {static: false}) eventAutocomplete: MatAutocomplete;
  @ViewChild('conditionInput', {static: false}) conditionInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoCond', {static: false}) condAutocomplete: MatAutocomplete;

  constructor(
    private authService: AuthenticateService,
    private journalService: JournalService) {
    this.journalService.getUserDoc();
    this.journalService.getMyConditions().subscribe(conditions => this.renderedConditions = conditions);
    this.filteredConditions = this.condCtrl.valueChanges.pipe(
      startWith(null),
      map((condition: string | null) => condition ? this._filterConditions(condition) : this.renderedConditions.slice()));
    this.journalService.getMyEvents().subscribe(events => this.renderedEvents = events);
    this.filteredEvents = this.eventCtrl.valueChanges.pipe(
      startWith(null),
      map((event: string | null) => event ? this._filterEvents(event) : this.renderedEvents.slice()));
  }

  addEventChip(event: MatChipInputEvent): void {
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.eventAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our fruit
      if ((value || '').trim()) {
        this.formEvents.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.eventCtrl.setValue(null);
    }
  }

  addConditionChip(event: MatChipInputEvent): void {
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.condAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our fruit
      if ((value || '').trim()) {
        this.formConditions.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.condCtrl.setValue(null);
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

  selectedEvent(event: MatAutocompleteSelectedEvent): void {
    console.log(event)
    this.formEvents.push(event.option.viewValue);
    this.eventInput.nativeElement.value = '';
    this.eventCtrl.setValue(null);
  }

  selectedCond(event: MatAutocompleteSelectedEvent): void {
    console.log(event)
    this.formConditions.push(event.option.viewValue);
    this.conditionInput.nativeElement.value = '';
    this.condCtrl.setValue(null);
  }

  private _filterEvents(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.renderedEvents.filter(event => event.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filterConditions(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.renderedConditions.filter(condition => condition.toLowerCase().indexOf(filterValue) === 0);
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

  getConditionData(condition: string) {
    this.journalService.getConditionData(condition)
    .subscribe(data => {
      console.log(data)
      this.conditionData.next(data);
    });
  }

  getCorrelation(event: string, condition: string): Observable<number> {
    this.journalService.getPhiCo(event, condition).subscribe(data => console.log(data))
    return this.journalService.getPhiCo(event, condition);
  }

  signOut() {
    this.authService.signOut();
  }

  ngOnInit() {
    this.myDoc = this.journalService.userFields;
    this.journaledToday = this.journalService.journaledToday();
    this.myConditions = this.journalService.getMyConditions();
    this.myEvents = this.journalService.getMyEvents();
    this.journalData = this.journalService.formJournalData();
  }

}
